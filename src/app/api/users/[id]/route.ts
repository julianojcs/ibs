import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/user'
import { auth } from '@/lib/auth'
import { profileSchema } from '@/lib/validations'
import { createError, formatErrorResponse, ErrorCode } from '@/lib/errors'

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

		const user = await User.findByIdAndUpdate(
			id,
			{ ...validationResult.data },
			{ new: true, runValidators: true }
		).select('-password -verificationToken -resetPasswordToken')

		if (!user) {
			const error = createError.notFound('User')
			return NextResponse.json(error.toJSON(), { status: error.statusCode })
		}

		return NextResponse.json({ user, message: 'Profile updated successfully!' })
	} catch (err) {
		const { body, status } = formatErrorResponse(err, 'PUT /api/users/[id]')
		return NextResponse.json(body, { status })
	}
}
