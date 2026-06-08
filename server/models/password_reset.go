package models

type FindAccountInput struct {
	Email string `json:"query" binding:"required"`
}

type SendResetOTPInput struct {
	UserID uint64 `json:"user_id" binding:"required"`
}

type VerifyResetOTPInput struct {
	UserID uint64 `json:"user_id" binding:"required"`
	OTP    string `json:"otp" binding:"required"`
}

type ResetPasswordInput struct {
	ResetToken string `json:"reset_token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

