'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PhotoCard } from '@/components/gallery/photo-card'
import { PhotoUpload } from '@/components/gallery/photo-upload'

interface PhotoUser {
	_id: string
	name: string
	avatar?: string
}

interface Photo {
	_id: string
	url: string
	thumbnailUrl?: string
	title?: string
	description?: string
	location?: string
	takenAt?: string
	uploadedBy: PhotoUser
	likes: PhotoUser[]
	createdAt: string
}

interface PaginationData {
	page: number
	limit: number
	total: number
	totalPages: number
}

interface PhotoUploadData {
	file: File
	title: string
	description: string
	location: string
	takenAt: string
}

export default function GalleryPage() {
	const searchParams = useSearchParams()
	const userIdFilter = searchParams.get('userId') || ''

	const [photos, setPhotos] = useState<Photo[]>([])
	const [pagination, setPagination] = useState<PaginationData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [isUploadOpen, setIsUploadOpen] = useState(false)

	const fetchPhotos = useCallback(async () => {
		setIsLoading(true)

		try {
			const params = new URLSearchParams()
			if (userIdFilter) params.set('userId', userIdFilter)
			params.set('page', page.toString())
			params.set('limit', '20')

			const response = await fetch(`/api/photos?${params}`)
			const data = await response.json()

			if (response.ok) {
				setPhotos(data.photos)
				setPagination(data.pagination)
			}
		} catch (err) {
			console.error('Failed to fetch photos:', err)
			toast.error('Failed to load photos')
		} finally {
			setIsLoading(false)
		}
	}, [userIdFilter, page])

	useEffect(() => {
		fetchPhotos()
	}, [fetchPhotos])

	const handleUpload = async (data: PhotoUploadData) => {
		const formData = new FormData()
		formData.append('file', data.file)
		formData.append('type', 'gallery')

		const uploadResponse = await fetch('/api/upload', {
			method: 'POST',
			body: formData,
		})

		if (!uploadResponse.ok) {
			const error = await uploadResponse.json()
			throw new Error(error.error || 'Upload failed')
		}

		const uploadResult = await uploadResponse.json()

		const photoResponse = await fetch('/api/photos', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: uploadResult.url,
				publicId: uploadResult.publicId,
				thumbnailUrl: uploadResult.thumbnailUrl,
				title: data.title,
				description: data.description,
				location: data.location,
				takenAt: data.takenAt,
			}),
		})

		if (!photoResponse.ok) {
			const error = await photoResponse.json()
			throw new Error(error.error || 'Failed to save photo')
		}

		toast.success('Photo uploaded successfully!')
		fetchPhotos()
	}

	const handleLike = async (photoId: string) => {
		try {
			const response = await fetch(`/api/photos/${photoId}/like`, {
				method: 'POST',
			})

			if (response.ok) {
				fetchPhotos()
			}
		} catch (err) {
			console.error('Failed to like photo:', err)
			toast.error('Failed to like photo')
		}
	}

	const handleDelete = async (photoId: string) => {
		try {
			const response = await fetch(`/api/photos/${photoId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				toast.success('Photo deleted successfully!')
				fetchPhotos()
			} else {
				const error = await response.json()
				toast.error(error.error || 'Failed to delete photo')
			}
		} catch (err) {
			console.error('Failed to delete photo:', err)
			toast.error('Failed to delete photo')
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Photo Gallery</h1>
					<p className="text-muted-foreground">
						Share and view memories from the London trip
					</p>
				</div>

				<Button onClick={() => setIsUploadOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Upload Photo
				</Button>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : photos.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground mb-4">
						No photos yet. Be the first to share!
					</p>
					<Button onClick={() => setIsUploadOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Upload your first photo
					</Button>
				</div>
			) : (
				<>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{photos.map((photo) => (
							<PhotoCard
								key={photo._id}
								photo={photo}
								onLike={handleLike}
								onDelete={handleDelete}
							/>
						))}
					</div>

					{pagination && pagination.totalPages > 1 && (
						<div className="flex items-center justify-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								Previous
							</Button>
							<span className="text-sm text-muted-foreground">
								Page {page} of {pagination.totalPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setPage((p) => Math.min(pagination.totalPages, p + 1))
								}
								disabled={page === pagination.totalPages}
							>
								Next
							</Button>
						</div>
					)}
				</>
			)}

			<PhotoUpload
				isOpen={isUploadOpen}
				onClose={() => setIsUploadOpen(false)}
				onUpload={handleUpload}
			/>
		</div>
	)
}
