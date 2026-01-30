import { z } from 'zod'
import { USER_ROLES } from '@/lib/constants'

/**
 * Schema for user registration validation
 */
export const registerSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name cannot exceed 100 characters'),
	email: z
		.string()
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one uppercase letter, one lowercase letter, and one number'
		),
	confirmPassword: z.string(),
	courseNumber: z
		.string()
		.min(1, 'Course number is required'),
	city: z
		.string()
		.min(1, 'City is required'),
	country: z
		.string()
		.min(1, 'Country is required'),
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

/**
 * Schema for user login validation
 */
export const loginSchema = z.object({
	email: z
		.string()
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Schema for forgot password validation
 */
export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.email('Please enter a valid email address'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/**
 * Schema for reset password validation
 */
export const resetPasswordSchema = z.object({
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one uppercase letter, one lowercase letter, and one number'
		),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword'],
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * Schema for user profile update validation
 */
export const profileSchema = z.object({
	name: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(100, 'Name cannot exceed 100 characters'),
	role: z.enum(
		Object.values(USER_ROLES) as [string, ...string[]],
		{ message: 'Role is required' }
	),
	courseNumber: z
		.string()
		.min(1, 'Course number is required'),
	city: z
		.string()
		.min(1, 'City is required'),
	country: z
		.string()
		.min(1, 'Country is required'),
	phone: z
		.string()
		.optional()
		.or(z.literal('')),
	whatsapp: z
		.string()
		.optional()
		.or(z.literal('')),
	linkedin: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
	instagram: z
		.string()
		.optional()
		.or(z.literal('')),
	github: z
		.string()
		.url('Please enter a valid URL')
		.optional()
		.or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>

/**
 * Schema for photo upload validation
 */
export const photoSchema = z.object({
	title: z
		.string()
		.max(100, 'Title cannot exceed 100 characters')
		.optional()
		.or(z.literal('')),
	description: z
		.string()
		.max(500, 'Description cannot exceed 500 characters')
		.optional()
		.or(z.literal('')),
	location: z
		.string()
		.max(100, 'Location cannot exceed 100 characters')
		.optional()
		.or(z.literal('')),
	takenAt: z
		.string()
		.optional()
		.or(z.literal('')),
	isPublic: z.boolean().default(true),
})

export type PhotoFormData = z.infer<typeof photoSchema>
