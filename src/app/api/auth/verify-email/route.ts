import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/user'
import { createError, formatErrorResponse, ErrorCode } from '@/lib/errors'

export async function POST(req: NextRequest) {
	try {
		const { token } = await req.json()

		if (!token) {
			return NextResponse.json(
				{ error: 'Verification token is required', code: ErrorCode.VALIDATION_REQUIRED_FIELD },
				{ status: 400 }
			)
		}

		await connectDB()

		const user = await User.findOne({
			verificationToken: token,
			verificationTokenExpires: { $gt: new Date() },
		}).select('+verificationToken +verificationTokenExpires')

		if (!user) {
			const error = createError.tokenExpired()
			return NextResponse.json(error.toJSON(), { status: error.statusCode })
		}

		await User.findByIdAndUpdate(user._id, {
			emailVerified: true,
			$unset: { verificationToken: 1, verificationTokenExpires: 1 },
		})

		return NextResponse.json(
			{ message: 'Email verified successfully! You can now sign in.' },
			{ status: 200 }
		)
	} catch (err) {
		const { body, status } = formatErrorResponse(err, 'POST /api/auth/verify-email')
		return NextResponse.json(body, { status })
	}
}
