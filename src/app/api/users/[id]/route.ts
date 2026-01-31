import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { User } from '@/models/user'
import { auth } from '@/lib/auth'
import { profileSchema } from '@/lib/validations'
import { createError, formatErrorResponse, ErrorCode } from '@/lib/errors'
import { sendVerificationEmail } from '@/lib/email'

interface RouteParams {
	params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
	try {
		const session = await auth()

		if (!session?.user) {
			const error = createError.unauthorized()
			return NextResponse.json(error.toJSON(), { status: error.statusCode })
		}

		const { id } = await params

		await connectDB()

		const user = await User.findById(id)
			.select('-password -verificationToken -resetPasswordToken')
			.lean()

		if (!user) {
			const error = createError.notFound('User')
			return NextResponse.json(error.toJSON(), { status: error.statusCode })
		}

		return NextResponse.json({ user })
	} catch (err) {
		const { body, status } = formatErrorResponse(err, 'GET /api/users/[id]')
		return NextResponse.json(body, { status })
	}
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
	try {
		const session = await auth()

		if (!session?.user) {
			const error = createError.unauthorized()
			return NextResponse.json(error.toJSON(), { status: error.statusCode })
		}

		const { id } = await params

		if (session.user.id !== id && session.user.role !== 'coordinator') {
			const error = createError.forbidden()
			return NextResponse.json(error.toJSON(), { status: error.statusCode })
		}

		const body = await req.json()
		const validationResult = profileSchema.safeParse(body)

		if (!validationResult.success) {
			return NextResponse.json(
				{
					error: validationResult.error.issues[0].message,
					code: ErrorCode.VALIDATION_FAILED,
				},
				{ status: 400 }
			)
		}

		await connectDB()

		const currentUser = await User.findById(id)
		if (!currentUser) {
			const error = createError.notFound('User')
			return NextResponse.json(error.toJSON(), { status: error.statusCode })
		}

		const updateData: any = { ...validationResult.data }
		let emailChanged = false

		if (updateData.email && updateData.email.toLowerCase() !== currentUser.email.toLowerCase()) {
			// Check if new email is already in use
			const emailExists = await User.findOne({
				email: updateData.email.toLowerCase(),
				_id: { $ne: id }
			})
			if (emailExists) {
				const error = createError.emailExists()
				return NextResponse.json(error.toJSON(), { status: error.statusCode })
			}

			emailChanged = true
			updateData.emailVerified = false
			updateData.verificationToken = crypto.randomBytes(32).toString('hex')
			updateData.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
		}

		const user = await User.findByIdAndUpdate(
			id,
			{ $set: updateData },
			{ new: true, runValidators: true }
		).select('-password -verificationToken -resetPasswordToken')

		if (emailChanged && user) {
			try {
				await sendVerificationEmail(user.email, updateData.verificationToken)
			} catch (emailError) {
				console.error('Failed to send verification email for email change:', emailError)
			}
		}

		return NextResponse.json({
			user,
			message: emailChanged
				? 'Profile updated! A verification email has been sent to your new address.'
				: 'Profile updated successfully!'
		})
	} catch (err) {
		const { body, status } = formatErrorResponse(err, 'PUT /api/users/[id]')
		return NextResponse.json(body, { status })
	}
}
