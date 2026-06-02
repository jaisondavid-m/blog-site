package models

type VerifyEmailInput struct {
	OTP string `json:"otp"`
}