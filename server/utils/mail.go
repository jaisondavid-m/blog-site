package utils

import (

	"os"

	"gopkg.in/gomail.v2"

)

func SendVerificationEmail(to, otp string) error {

	m := gomail.NewMessage()

	m.SetHeader("From",os.Getenv("SMTP_EMAIL"))
	m.SetHeader("To",to)
	m.SetHeader("Subject","Verify Your Email")

	m.SetBody("text/html",
		"<h2>Email Verification</h2>"+
		"<p>Your OTP is:</p>"+
		"<h1>"+otp+"</h1>"+
		"<p>This OTP expires in 2 minutes.</p>",
	)

	d := gomail.NewDialer(
		os.Getenv("SMTP_HOST"),
		587,
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("SMTP_PASSWORD"),
	)

	return d.DialAndSend(m)

}