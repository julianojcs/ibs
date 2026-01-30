import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { User } from '@/models/user'
import { sendPasswordResetEmail } from '@/lib/email'
import { forgotPasswordSchema } from '@/lib/validations'
import { formatErrorResponse, ErrorCode } from '@/lib/errors'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()

		const validationResult = forgotPasswordSchema.safeParse(body)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: validationResult.error.issues[0].message,
					code: ErrorCode.VALIDATION_FAILED,
				},
				{ status: 400 }
			)
		}

		const { email } = validationResult.data

		await connectDB()

		const user = await User.findOne({ email: email.toLowerCase() })

		if (!user) {
			// Return success even if user doesn't exist for security
			return NextResponse.json(
				{
					message:
						'If an account with that email exists, you will receive a password reset link.',
				},
				{ status: 200 }
			)
		}

		const resetToken = crypto.randomBytes(32).toString('hex')
		const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

		await User.findByIdAndUpdate(user._id, {
			resetPasswordToken: resetToken,
			resetPasswordTokenExpires: resetTokenExpires,
		})

		try {
			await sendPasswordResetEmail(user.email, resetToken)
		} catch (emailError) {
			console.error('Failed to send password reset email:', emailError)
			// Still return success for security - don't reveal if email exists
		}

		return NextResponse.json(
			{
				message:
					'If an account with that email exists, you will receive a password reset link.',
			},
			{ status: 200 }
		)
	} catch (err) {
		const { body, status } = formatErrorResponse(err, 'POST /api/auth/forgot-password')
		return NextResponse.json(body, { status })
	}
}
