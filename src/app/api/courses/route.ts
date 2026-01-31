
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Course } from '@/models/course'
import { auth } from '@/lib/auth'

export async function GET() {
	try {
		await connectDB()

		const courses = await Course.find({ isActive: true })
			.select('name code startDate endDate')
			.sort({ startDate: -1 })

		return NextResponse.json(courses)
	} catch (error) {
		console.error('Failed to fetch courses:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch courses' },
			{ status: 500 }
		)
	}
}
