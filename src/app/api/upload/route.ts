import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadAvatar, uploadImage } from '@/lib/cloudinary'
import { connectDB } from '@/lib/db'
import { User } from '@/models/user'

export async function POST(req: NextRequest) {
	try {
		const session = await auth()

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const file = formData.get('file') as File
		const type = formData.get('type') as string

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 })
		}

		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' },
				{ status: 400 }
			)
		}

		const maxSize = 10 * 1024 * 1024 // 10MB

		if (file.size > maxSize) {
			return NextResponse.json(
				{ error: 'File size too large. Maximum size is 10MB.' },
				{ status: 400 }
			)
		}

		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)
		const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

		if (type === 'avatar') {
			const result = await uploadAvatar(base64, session.user.id)

			await connectDB()
			await User.findByIdAndUpdate(session.user.id, { avatar: result.url })

			return NextResponse.json({
				url: result.url,
				publicId: result.publicId,
				thumbnailUrl: result.thumbnailUrl,
				message: 'Avatar uploaded successfully!',
			})
		}

		const result = await uploadImage(base64, 'ibs-london/gallery')

		return NextResponse.json({
			url: result.url,
			publicId: result.publicId,
			thumbnailUrl: result.thumbnailUrl,
		})
	} catch (err) {
		console.error('Upload error:', err)
		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 }
		)
	}
}
