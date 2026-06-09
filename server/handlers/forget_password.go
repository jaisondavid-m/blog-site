package handlers

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"server/config"
	"server/models"
	"server/utils"
	"strings"
	// "time"

	"github.com/gin-gonic/gin"
)

const (
	OTPPurposePasswordReset 	= "password_reset"
	ResetTokenExpiryMinutes		= 10
	OTPPasswordResetExpiryMins  = 2
)

func FindAccount(c *gin.Context) {

	var input models.FindAccountInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid input",
		})
		return
	}

	email := strings.TrimSpace(input.Email)
	if email == "" {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Email address is required",
		})
		return
	}

	var (
		userID 		uint64
		userEmail 	string
	)

	err := config.DB.QueryRow(
		`SELECT id, email
		FROM users
		WHERE email = ?
			AND deleted_at IS NULL
		LIMIT 1`,
		email,
	).Scan(&userID,&userEmail)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound,gin.H{
			"error":"No account found with that email address",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Database error",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"masked_email": maskEmail(userEmail),
		"user_id": userID,
	})

}

func SendPasswordResetOTP(c *gin.Context) {
	
	var input models.SendResetOTPInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid input",
		})
		return
	}

	var email string

	err := config.DB.QueryRow(
		"SELECT email FROM users WHERE id = ? AND deleted_at IS NULL",
		input.UserID,
	).Scan(&email)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound,gin.H{
			"error":"User not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Database error",
		})
		return
	}

	var count int
	err = config.DB.QueryRow(
		`SELECT COUNT(*)
		FROM otp_requests
		WHERE user_id = ?
			AND purpose = ?
			AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
		input.UserID,OTPPurposePasswordReset,
	).Scan(&count)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Dadtabase error",
		})
		return
	}

	if count > 0 {
		c.JSON(http.StatusTooManyRequests,gin.H{
			"error":"Please wait before requesting another OTP",
		})
		return
	}

	_, err = config.DB.Exec(
		`UPDATE otp_requests
		SET verified = TRUE, verified_at = NOW()
		WHERE user_id = ?
			AND purpose = ?
			AND verified = FALSE`,
		input.UserID, OTPPurposePasswordReset,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to invalidate old OTPs",
		})
		return
	}

	otp := utils.GenerateOTP()

	_, err = config.DB.Exec(
		`INSERT INTO otp_requests (user_id, otp_code, purpose, expires_at)
		VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
		input.UserID, otp, OTPPurposePasswordReset, OTPPasswordResetExpiryMins,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to create OTP",
		})
		return
	}

	fmt.Println("userid: ", input.UserID)
	fmt.Println("email: ",email)
	// fmt.Println("otp: ",otp)
	fmt.Println("SMTP host =",os.Getenv("SMTP_HOST"))
	fmt.Println("SMTP port:",os.Getenv("SMTP_PORT"))
	fmt.Println("SMTP email:",os.Getenv("SMTP_EMAIL"))

	if err := utils.SendPasswordResetEmail(email, otp); err != nil {
		fmt.Println("SEND EMAIL error: ",err)
		config.DB.Exec(
			"DELETE FROM otp_requests WHERE user_id = ? AND otp_code = ?",
			input.UserID, otp,
		)
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to send email",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"OTP sent successfully",
	})

}

func VerifyPasswordResetOTP(c *gin.Context) {

	var input models.VerifyResetOTPInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid input",
		})
		return
	}

	var otpID uint64

	err := config.DB.QueryRow(
		`SELECT id
		FROM otp_requests
		WHERE user_id = ?
			AND otp_code = ?
			AND purpose = ?
			AND verified = FALSE
			AND expires_at > NOW()
		ORDER BY id DESC
		LIMIT 1`,
		input.UserID, input.OTP, OTPPurposePasswordReset,
	).Scan(&otpID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Invalid or expired OTP",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Database error",
		})
		return
	}

	_, err = config.DB.Exec(
		"UPDATE otp_requests SET verified = TRUE, verified_at = NOW() WHERE id = ?",
		otpID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Failed to verify OTP",
		})
		return
	}

	resetToken, err := generateSecureToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to generate reset token",
		})
		return
	}

	// expiresAt := time.Now().Add(time.Duration(ResetTokenExpiryMinutes) * time.Minute)

	_, err = config.DB.Exec(
		`INSERT INTO password_reset_tokens (user_id, token, expires_at)
		VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
		ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), used = FALSE`,
		input.UserID, resetToken, ResetTokenExpiryMinutes,
	)

	if err != nil {
		fmt.Println("store reset token err: ",err)
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to store reset token",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"reset_token":resetToken,
	})

}

func ResetPassword(c *gin.Context) {

	var input models.ResetPasswordInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid input",
		})
		return
	}

	if len(input.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Password must be at least 8 characters",
		})
		return
	}

	var (
		tokenID uint64
		userID 	uint64
	)

	err := config.DB.QueryRow(
		`SELECT id, user_id
		FROM password_reset_tokens
		WHERE token = ?
			AND used = FALSE
			AND expires_at > NOW()
		LIMIT 1`,
		input.ResetToken,
	).Scan(&tokenID, &userID)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Reset link is invalid or has expires. Please start over.",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Database error",
		})
		return
	}

	hashedPassword, err := utils.HashPassword(input.NewPassword)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to process password",
		})
		return
	}

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to start transaction",
		})
		return
	}

	defer tx.Rollback()

	_, err = tx.Exec(
		"UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
		hashedPassword, userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to update password",
		})
		return
	}

	_, err = tx.Exec(
		"UPDATE password_reset_tokens SET used = TRUE WHERE id = ?",
		tokenID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to invalidate token",
		})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to commit transaction",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"Password reset successfully",
	})

}

func maskEmail(email string) string {

	parts := strings.SplitN(email, "@", 2)

	if len(parts) != 2 {
		return email
	}

	local := parts[0]
	domain := parts[1]

	if len(local) <= 1 {
		return local + "***@" + domain
	}

	return fmt.Sprintf("%s***%s",string(local[0]),domain)

}


func generateSecureToken() (string, error) {

	b := make([]byte,32)

	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return hex.EncodeToString(b), nil

}