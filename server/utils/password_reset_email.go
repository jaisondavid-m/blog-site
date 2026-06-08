package utils

import (
	"os"

	"gopkg.in/gomail.v2"
)

func SendPasswordResetEmail(to, otp string) error {

	m := gomail.NewMessage()

	m.SetHeader("From", os.Getenv("SMTP_EMAIL"))
	m.SetHeader("To", to)
	m.SetHeader("Subject","Reset Your Password")

	m.SetBody("text/html",
		`
		<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;" >
			<h2 style="color:#1e1b4b;margin-bottom:4px;">Password Reset</h2>
			<p style="color:#6b7280;">
				We received a request to reset the password for your Blog-Site account.
			</p>
			<div style="background:#f5f3ff;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
				<p style="color:#6b7280;font-size:13px;margin:0 0 8px;">Your one-time code</p>
				<h1 style="color:#4f46e5;font-size:40px;letter-spacing:12px;margin:0">` + otp + `</h1>
			</div>
			<p style="color:#6b7280;font-size:13px">This code expires in <strong>2 minutes</strong>.</p>
			<p style="color:#6b7280;font-size:13px;">If you did not request a password resest, you can safely ignore this email.</p>
		</div>
		`,
	)

	d := gomail.NewDialer(
		os.Getenv("STMP_HOST"),
		587,
		os.Getenv("STMP_EMAIL"),
		os.Getenv("SMTP_PASSWORD"),
	)

	return d.DialAndSend(m)

}