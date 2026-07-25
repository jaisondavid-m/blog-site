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
		<div style="background:#f4f4f7;padding:40px 16px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;" >
			<div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);" >
				<div style="height:6px;background:#4f46e5;" ></div>
				<div style="padding:36px 32px;" >
					<p style="color:#4f46e5;font-weight:600;font-size:22px;letter-spacing:1px;text-transform:uppercase;margin:0 0 20px;" >
						Blog-Site
					</p>
					<h2 style="color:#1e1b4b;margin:0 0 8px;font-size:22px;" >Reset your password</h2>
					<p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 28px; >
						We received a request to reset the password for your account. Use the code below to continue
					</p>
					<div style="background:#f5f3ff;border:1px solid #e0d9fb;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;" >
						<p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;" >
							Your one-time code
						</p>
						<div style="color:#4f46e5;font-size:36px;font-weight:700;letter-spacing:8px;font-family:'Courier New',monospace;" >
							` + otp +`
						</div>
						<p style="color:#9ca3af;font-size:12px;margin:14px 0 0;" >
							Expires in <strong style="color:#6b7280" >2 minutes</strong>
						</p>
					</div>
					<p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0" >
						If you didn't request a password reset, you can safely ignore this email - your password won't be changed.
					</p>
				</div>
				<div style="background:#fafafa;padding:20px 32px;border-top:1px solid #f0f0f0;" >
					<p  style="color:#b0b3aa;font-size:11px;margin:0;text-align:center">
						© 2026 Blog-Site. All rights reserved.
					</p>
				</div>
			</div>
		</div>
		// <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;" >
		// 	<h2 style="color:#1e1b4b;margin-bottom:4px;">Password Reset</h2>
		// 	<p style="color:#6b7280;">
		// 		We received a request to reset the password for your Blog-Site account.
		// 	</p>
		// 	<div style="background:#f5f3ff;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
		// 		<p style="color:#6b7280;font-size:13px;margin:0 0 8px;">Your one-time code</p>
		// 		<h1 style="color:#4f46e5;font-size:40px;letter-spacing:12px;margin:0">` + otp + `</h1>
		// 	</div>
		// 	<p style="color:#6b7280;font-size:13px">This code expires in <strong>2 minutes</strong>.</p>
		// 	<p style="color:#6b7280;font-size:13px;">If you did not request a password resest, you can safely ignore this email.</p>
		// </div>
		`,
	)

	d := gomail.NewDialer(
		os.Getenv("SMTP_HOST"),
		587,
		os.Getenv("SMTP_EMAIL"),
		os.Getenv("SMTP_PASSWORD"),
	)

	return d.DialAndSend(m)

}