import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
	url: string
	publicId: string
	thumbnailUrl: string
}

/**
 * Uploads an image to Cloudinary
 * @param file - Base64 encoded image or file path
 * @param folder - Folder name in Cloudinary
 * @returns Upload result with URLs
 */
export async function uploadImage(
	file: string,
	folder: string = 'ibs-london'
): Promise<CloudinaryUploadResult> {
	const result = await cloudinary.uploader.upload(file, {
		folder,
		resource_type: 'image',
		transformation: [
			{ quality: 'auto', fetch_format: 'auto' },
			{ width: 1920, height: 1080, crop: 'limit' },
		],
	})

	const thumbnailUrl = cloudinary.url(result.public_id, {
		transformation: [
			{ width: 400, height: 400, crop: 'fill', gravity: 'auto' },
			{ quality: 'auto', fetch_format: 'auto' },
		],
	})

	return {
		url: result.secure_url,
		publicId: result.public_id,
		thumbnailUrl,
	}
}

/**
 * Uploads an avatar image to Cloudinary
 * @param file - Base64 encoded image
 * @param userId - User ID for folder organization
 * @returns Upload result with URLs
 */
export async function uploadAvatar(
	file: string,
	userId: string
): Promise<CloudinaryUploadResult> {
	const result = await cloudinary.uploader.upload(file, {
		folder: `ibs-london/avatars`,
		public_id: userId,
		overwrite: true,
		resource_type: 'image',
		transformation: [
			{ width: 400, height: 400, crop: 'fill', gravity: 'face' },
			{ quality: 'auto', fetch_format: 'auto' },
		],
	})

	const thumbnailUrl = cloudinary.url(result.public_id, {
		transformation: [
			{ width: 100, height: 100, crop: 'fill', gravity: 'face' },
			{ quality: 'auto', fetch_format: 'auto' },
		],
	})

	return {
		url: result.secure_url,
		publicId: result.public_id,
		thumbnailUrl,
	}
}

/**
 * Deletes an image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteImage(publicId: string): Promise<void> {
	await cloudinary.uploader.destroy(publicId)
}

export default cloudinary
