
import { config } from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'
import { Course } from '../src/models/course'

// Load env vars
config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
	console.error('❌ MONGODB_URI is not defined in .env.local')
	process.exit(1)
}

const courses = [
	{
		name: 'Applied Data Science for Business',
		code: 'ADBS',
		startDate: new Date('2026-01-12'),
		endDate: new Date('2026-01-29'),
		location: 'London',
		isActive: true,
	},
	{
		name: 'Contemporary Topics in Business Strategy',
		code: 'CTBS',
		startDate: new Date('2026-01-12'),
		endDate: new Date('2026-01-29'),
		location: 'London',
		isActive: true,
	},
]

async function seedCourses() {
	try {
		console.log('Connecting to MongoDB...')
		await mongoose.connect(MONGODB_URI!)
		console.log('✅ Connected.')

		console.log('Seeding courses...')

		for (const courseData of courses) {
			// Check if exists
			const exists = await Course.findOne({ code: courseData.code })
			if (exists) {
				console.log(`Course ${courseData.code} already exists. Updating...`)
				await Course.updateOne({ _id: exists._id }, courseData)
			} else {
				console.log(`Creating course ${courseData.code}...`)
				await Course.create(courseData)
			}
		}

		console.log('✅ Seeding completed successfully.')
		process.exit(0)
	} catch (error) {
		console.error('❌ Seeding failed:', error)
		process.exit(1)
	}
}

seedCourses()
