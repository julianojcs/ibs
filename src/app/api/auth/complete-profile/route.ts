import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/user'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { email, name, googleId, avatar, courseName, city, country, role } =
			body

		if (!email || !name || !googleId || !courseName || !city || !country) {
			return NextResponse.json(
				{ error: 'All required fields must be provided' },
				{ status: 400 }
			)
		}

		await connectDB()

		const existingUser = await User.findOne({
			$or: [{ email: email.toLowerCase() }, { googleId }],
		})

		if (existingUser) {
			return NextResponse.json(
				{ error: 'An account with this email or Google account already exists' },
				{ status: 409 }
			)
		}

		const user = await User.create({
			name,
			email: email.toLowerCase(),
			googleId,
			avatar,
			courseName,
			city,
			country,
			role: role || 'student',
			emailVerified: true,
			isActive: true,
		})

		return NextResponse.json(
			{
				message: 'Profile completed successfully!',
				userId: user._id.toString(),
			},
			{ status: 201 }
		)
	} catch (err) {
		console.error('Complete profile error:', err)
		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 }
		)
	}
}
