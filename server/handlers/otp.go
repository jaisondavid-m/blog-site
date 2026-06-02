package handlers

import (
	"database/sql"
	"net/http"
	"server/config"
	"server/models"
	"server/utils"

	"github.com/gin-gonic/gin"
)
const (
		OTPPurposeEmailVerification = "email_verification"
		OTPExpiryMinutes = 2
	)
func SendVerificationOTP(c *gin.Context) {

	userID := c.MustGet("user_id").(uint64)

	var email string
	var emailVerified bool

	// err = config.DB.QueryRow(
	// 	"SELECT email FROM users WHERE id = ?",
	// 	userID,
	// ).Scan(&email)

	// if err != nil {
	// 	c.JSON(http.StatusNotFound,gin.H{
	// 		"error":"User not Found",
	// 	})
	// 	return
	// }

	err := config.DB.QueryRow(
		"SELECT email, email_verified FROM users WHERE id = ?",
		userID,
	).Scan(&email, &emailVerified)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound,gin.H{
			"error":"User not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusNotFound,gin.H{
			"error":"Database error",
		})
		return 
	}

	if emailVerified {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Email already verified",
		})
		return 
	}

	var count int

	err = config.DB.QueryRow(
		`SELECT COUNT(*)
		FROM otp_requests
		WHERE user_id = ?
		AND purpose = ?
		AND created_at >= DATE_SUB(NOW(),INTERVAL 1 MINUTE)`,
		userID,OTPPurposeEmailVerification,
	).Scan(&count)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Database error",
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
		SET verified = TRUE,
			verified_at = NOW()
		WHERE user_id = ?
		AND purpose = ?
		AND verified = FALSE`,
		userID,
		OTPPurposeEmailVerification,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to invalidate old OTPs",
		})
		return 
	}

	

	otp := utils.GenerateOTP()

	_, err = config.DB.Exec(
		`INSERT INTO otp_requests (
			user_id,
			otp_code,
			purpose,
			expires_at
		)
		VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE))`,
		userID,
		otp,
		OTPPurposeEmailVerification,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to create OTP",
		})
		return
	}

	err = utils.SendVerificationEmail(email, otp)

	if err != nil {

		config.DB.Exec(
			`DELETE FROM otp_requests
			WHERE user_id = ?
			AND otp_code = ?`,
			userID,
			otp,
		)

		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to send email.",
		})
		return 
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"OTP sent successfully",
	})

}

func VerifyEmail(c *gin.Context) {

	userID := c.MustGet("user_id").(uint64)

	var input models.VerifyEmailInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid input",
		})
		return
	}

	var otpID uint64

	err := config.DB.QueryRow(
		`
		SELECT id
		FROM otp_requests
		WHERE user_id = ?
		AND otp_code = ?
		AND purpose = ?
		AND verified = FALSE
		AND expires_at > NOW()
		ORDER BY id DESC
		LIMIT 1
		`,
		userID,
		input.OTP,
		OTPPurposeEmailVerification,
	).Scan(&otpID)

	if err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid or expired OTP",
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

	_, err = tx.Exec(`
		UPDATE users
		SET
			email_verified = TRUE,
			email_verified_at = NOW()
		WHERE id = ?
	`,userID)

	if err != nil {
		tx.Rollback()
		return
	}

	_, err = tx.Exec(`
		UPDATE otp_requests
		SET
			verified = TRUE,
			verified_at = NOW()
		WHERE id = ?
	`,otpID)

	if err != nil {
		tx.Rollback()
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to commit transaction",
		})
		return
	}
	
	c.JSON(http.StatusOK,gin.H{
		"message":"Email verified successfully",
	})

}