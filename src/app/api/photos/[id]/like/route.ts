import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Photo } from '@/models/photo'
import { auth } from '@/lib/auth'

interface RouteParams {
	params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
	try {
		const session = await auth()

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await params

		await connectDB()

		const photo = await Photo.findById(id)

		if (!photo) {
			return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
		}

		const userId = session.user.id
		const hasLiked = photo.likes.some(
			(likeId: { toString: () => string }) => likeId.toString() === userId
		)

		if (hasLiked) {
			await Photo.findByIdAndUpdate(id, { $pull: { likes: userId } })
			return NextResponse.json({ liked: false, message: 'Like removed' })
		}

		await Photo.findByIdAndUpdate(id, { $addToSet: { likes: userId } })
		return NextResponse.json({ liked: true, message: 'Photo liked!' })
	} catch (err) {
		console.error('Like photo error:', err)
		return NextResponse.json(
			{ error: 'Something went wrong. Please try again.' },
			{ status: 500 }
		)
	}
}
