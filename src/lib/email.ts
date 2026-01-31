import nodemailer from 'nodemailer'

interface EmailOptions {
	to: string
	subject: string
	html: string
}

const port = parseInt(process.env.EMAIL_PORT || '465')

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port,
	secure: port === 465, // true for 465, false for other ports
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
})

/**
 * Sends an email using Nodemailer
 * @param options - Email options including recipient, subject, and HTML content
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
	await transporter.sendMail({
		from: process.env.EMAIL_FROM,
		to: options.to,
		subject: options.subject,
		html: options.html,
	})
}

/**
 * Sends email verification link to user
 * @param email - User's email address
 * @param token - Verification token
 */
export async function sendVerificationEmail(
	email: string,
	token: string
): Promise<void> {
	const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

	await sendEmail({
		to: email,
		subject: 'Verify your email - IBS London',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
				<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
					<div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
						<div style="text-align: center; margin-bottom: 30px;">
							<h1 style="color: #18181b; margin: 0; font-size: 24px;">IBS London</h1>
							<p style="color: #71717a; margin-top: 8px;">Classmate Registration System</p>
						</div>

						<h2 style="color: #18181b; font-size: 20px; margin-bottom: 16px;">Verify your email address</h2>

						<p style="color: #3f3f46; line-height: 1.6; margin-bottom: 24px;">
							Thank you for registering! Please click the button below to verify your email address and complete your registration.
						</p>

						<div style="text-align: center; margin: 32px 0;">
							<a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
								Verify Email
							</a>
						</div>

						<p style="color: #71717a; font-size: 14px; line-height: 1.6;">
							If you didn't create an account, you can safely ignore this email.
						</p>

						<p style="color: #71717a; font-size: 14px; line-height: 1.6; margin-top: 24px;">
							If the button doesn't work, copy and paste this link into your browser:
							<br>
							<a href="${verifyUrl}" style="color: #2563eb; word-break: break-all;">${verifyUrl}</a>
						</p>
					</div>

					<p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
						© ${new Date().getFullYear()} IBS London. All rights reserved.
					</p>
				</div>
			</body>
			</html>
		`,
	})
}

/**
 * Sends password reset link to user
 * @param email - User's email address
 * @param token - Reset token
 */
export async function sendPasswordResetEmail(
	email: string,
	token: string
): Promise<void> {
	const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

	await sendEmail({
		to: email,
		subject: 'Reset your password - IBS London',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
				<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
					<div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
						<div style="text-align: center; margin-bottom: 30px;">
							<h1 style="color: #18181b; margin: 0; font-size: 24px;">IBS London</h1>
							<p style="color: #71717a; margin-top: 8px;">Classmate Registration System</p>
						</div>

						<h2 style="color: #18181b; font-size: 20px; margin-bottom: 16px;">Reset your password</h2>

						<p style="color: #3f3f46; line-height: 1.6; margin-bottom: 24px;">
							We received a request to reset your password. Click the button below to create a new password.
						</p>

						<div style="text-align: center; margin: 32px 0;">
							<a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
								Reset Password
							</a>
						</div>

						<p style="color: #71717a; font-size: 14px; line-height: 1.6;">
							This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
						</p>

						<p style="color: #71717a; font-size: 14px; line-height: 1.6; margin-top: 24px;">
							If the button doesn't work, copy and paste this link into your browser:
							<br>
							<a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
						</p>
					</div>

					<p style="text-align: center; color: #a1a1aa; font-size: 12px; margin-top: 24px;">
						© ${new Date().getFullYear()} IBS London. All rights reserved.
					</p>
				</div>
			</body>
			</html>
		`,
	})
}
