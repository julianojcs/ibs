import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { User } from '@/models/user'
import { sendVerificationEmail } from '@/lib/email'
import { registerSchema } from '@/lib/validations'
import { createError, formatErrorResponse, ErrorCode } from '@/lib/errors'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()

		const validationResult = registerSchema.safeParse(body)

		if (!validationResult.success) {
			const fieldErrors = validationResult.error.issues.map((issue) => ({
				field: issue.path.join('.'),
				message: issue.message,
			}))
			return NextResponse.json(
				{
					error: fieldErrors[0].message,
					code: ErrorCode.VALIDATION_FAILED,
					fields: fieldErrors,
				},
				{ status: 400 }
			)
		}

		const { name, email, password, courseName, city, country, company, bio, twitter } =
			validationResult.data

		await connectDB()

		const existingUser = await User.findOne({ email: email.toLowerCase() })

		if (existingUser) {
			const error = createError.emailExists()
			return NextResponse.json(error.toJSON(), { status: error.statusCode })
		}

		const hashedPassword = await bcrypt.hash(password, 12)
		const verificationToken = crypto.randomBytes(32).toString('hex')
		const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

		const user = await User.create({
			name,
			email: email.toLowerCase(),
			password: hashedPassword,
			courseName,
			city,
			country,
			company,
			bio,
			twitter,
			verificationToken,
			verificationTokenExpires,
			emailVerified: false,
			isActive: true,
		})

		try {
			await sendVerificationEmail(user.email, verificationToken)
		} catch (emailError) {
			// Log email error but don't fail registration
			console.error('Failed to send verification email:', emailError)
			// User is created, they can request new verification email later
		}

		return NextResponse.json(
			{
				message:
					'Registration successful! Please check your email to verify your account.',
				userId: user._id,
			},
			{ status: 201 }
		)
	} catch (err) {
		const { body, status } = formatErrorResponse(err, 'POST /api/auth/register')
		return NextResponse.json(body, { status })
	}
}
