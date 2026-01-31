'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'

interface PhotoUploadProps {
	isOpen: boolean
	onClose: () => void
	onUpload: (data: PhotoUploadData) => Promise<void>
}

interface PhotoUploadData {
	file: File
	title: string
	description: string
	location: string
	takenAt: string
}

export function PhotoUpload({ isOpen, onClose, onUpload }: PhotoUploadProps) {
	const [file, setFile] = useState<File | null>(null)
	const [preview, setPreview] = useState<string | null>(null)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [location, setLocation] = useState('')
	const [takenAt, setTakenAt] = useState('')
	const [isUploading, setIsUploading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleDrop = useCallback((acceptedFiles: File[]) => {
		const selectedFile = acceptedFiles[0]
		if (selectedFile) {
			setFile(selectedFile)
			setPreview(URL.createObjectURL(selectedFile))
			setError(null)
		}
	}, [])

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: handleDrop,
		accept: {
			'image/jpeg': ['.jpg', '.jpeg'],
			'image/png': ['.png'],
			'image/webp': ['.webp'],
			'image/gif': ['.gif'],
		},
		maxSize: 10 * 1024 * 1024, // 10MB
		maxFiles: 1,
		onDropRejected: (rejections) => {
			const rejection = rejections[0]
			if (rejection.errors[0].code === 'file-too-large') {
				setError('File is too large. Maximum size is 10MB.')
			} else if (rejection.errors[0].code === 'file-invalid-type') {
				setError('Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.')
			} else {
				setError('Invalid file.')
			}
		},
	})

	const handleRemoveFile = () => {
		setFile(null)
		if (preview) {
			URL.revokeObjectURL(preview)
			setPreview(null)
		}
	}

	const handleClose = () => {
		handleRemoveFile()
		setTitle('')
		setDescription('')
		setLocation('')
		setTakenAt('')
		setError(null)
		onClose()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!file) {
			setError('Please select a photo to upload.')
			return
		}

		setIsUploading(true)
		setError(null)

		try {
			await onUpload({
				file,
				title,
				description,
				location,
				takenAt,
			})
			handleClose()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
		} finally {
			setIsUploading(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				className="max-w-lg"
				onInteractOutside={(e) => {
					e.preventDefault()
				}}
			>
				<DialogHeader>
					<DialogTitle>Upload Photo</DialogTitle>
					<DialogDescription>
						Share a photo from your London trip with your colleagues.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div
							className="bg-destructive/10 text-destructive text-sm p-3 rounded-md"
							role="alert"
						>
							{error}
						</div>
					)}

					{!file ? (
						<div
							{...getRootProps()}
							className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
								isDragActive
									? 'border-primary bg-primary/5'
									: 'border-muted-foreground/25 hover:border-primary/50'
							}`}
						>
							<input {...getInputProps()} />
							<ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-sm text-muted-foreground">
								{isDragActive
									? 'Drop the photo here...'
									: 'Drag & drop a photo, or click to select'}
							</p>
							<p className="text-xs text-muted-foreground mt-2">
								Max 10MB • JPEG, PNG, WebP, GIF
							</p>
						</div>
					) : (
						<div className="relative">
							<img
								src={preview || ''}
								alt="Preview"
								className="w-full h-48 object-cover rounded-lg"
							/>
							<Button
								type="button"
								variant="destructive"
								size="icon"
								className="absolute top-2 right-2 h-8 w-8"
								onClick={handleRemoveFile}
								aria-label="Remove photo"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="title">Title (optional)</Label>
						<Input
							id="title"
							placeholder="e.g., Big Ben at sunset"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={100}
							disabled={isUploading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description (optional)</Label>
						<Textarea
							id="description"
							placeholder="Tell us about this photo..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							maxLength={500}
							rows={3}
							disabled={isUploading}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="location">Location (optional)</Label>
							<Input
								id="location"
								placeholder="e.g., Tower Bridge"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								maxLength={100}
								disabled={isUploading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="takenAt">Date taken (optional)</Label>
							<Input
								id="takenAt"
								type="date"
								value={takenAt}
								onChange={(e) => setTakenAt(e.target.value)}
								disabled={isUploading}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isUploading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!file || isUploading}>
							{isUploading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="mr-2 h-4 w-4" />
									Upload
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
