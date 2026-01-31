/**
 * Image compression utility for client-side image resizing
 * Reduces image size before upload to improve upload speed
 */

interface CompressImageOptions {
	maxWidth?: number
	maxHeight?: number
	quality?: number
	maxSizeMB?: number
}

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
	maxWidth: 1920,
	maxHeight: 1920,
	quality: 0.85,
	maxSizeMB: 2,
}

/**
 * Compresses an image file by resizing and reducing quality
 * @param file - The original image file
 * @param options - Compression options
 * @returns A promise that resolves to the compressed file
 */
export async function compressImage(
	file: File,
	options: CompressImageOptions = {}
): Promise<File> {
	const opts = { ...DEFAULT_OPTIONS, ...options }

	// If file is already small enough and not too large in dimensions, return as-is
	const fileSizeMB = file.size / (1024 * 1024)
	if (fileSizeMB <= opts.maxSizeMB) {
		// Still check dimensions
		const needsResize = await checkIfNeedsResize(file, opts.maxWidth, opts.maxHeight)
		if (!needsResize) {
			return file
		}
	}

	return new Promise((resolve, reject) => {
		const img = new Image()
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')

		img.onload = () => {
			try {
				let { width, height } = img

				// Calculate new dimensions while maintaining aspect ratio
				if (width > opts.maxWidth || height > opts.maxHeight) {
					const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height)
					width = Math.round(width * ratio)
					height = Math.round(height * ratio)
				}

				canvas.width = width
				canvas.height = height

				if (!ctx) {
					reject(new Error('Could not get canvas context'))
					return
				}

				// Draw image with high-quality scaling
				ctx.imageSmoothingEnabled = true
				ctx.imageSmoothingQuality = 'high'
				ctx.drawImage(img, 0, 0, width, height)

				// Convert to blob
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							reject(new Error('Could not compress image'))
							return
						}

						// Create new file with same name but compressed
						const compressedFile = new File([blob], file.name, {
							type: 'image/jpeg',
							lastModified: Date.now(),
						})

						resolve(compressedFile)
					},
					'image/jpeg',
					opts.quality
				)
			} catch (error) {
				reject(error)
			} finally {
				// Clean up
				URL.revokeObjectURL(img.src)
			}
		}

		img.onerror = () => {
			URL.revokeObjectURL(img.src)
			reject(new Error('Could not load image'))
		}

		img.src = URL.createObjectURL(file)
	})
}

/**
 * Checks if an image needs to be resized based on dimensions
 */
async function checkIfNeedsResize(
	file: File,
	maxWidth: number,
	maxHeight: number
): Promise<boolean> {
	return new Promise((resolve) => {
		const img = new Image()

		img.onload = () => {
			const needsResize = img.width > maxWidth || img.height > maxHeight
			URL.revokeObjectURL(img.src)
			resolve(needsResize)
		}

		img.onerror = () => {
			URL.revokeObjectURL(img.src)
			resolve(false)
		}

		img.src = URL.createObjectURL(file)
	})
}

/**
 * Formats file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return bytes + ' B'
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
	return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
