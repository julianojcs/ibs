/**
 * Centralized Error Handling System
 * Professional error management for IBS London application
 */

// Error codes for categorization
export const ErrorCode = {
	// Authentication errors (1xxx)
	AUTH_INVALID_CREDENTIALS: 'AUTH_001',
	AUTH_EMAIL_NOT_VERIFIED: 'AUTH_002',
	AUTH_ACCOUNT_DEACTIVATED: 'AUTH_003',
	AUTH_SESSION_EXPIRED: 'AUTH_004',
	AUTH_UNAUTHORIZED: 'AUTH_005',
	AUTH_GOOGLE_SIGNIN_REQUIRED: 'AUTH_006',

	// Validation errors (2xxx)
	VALIDATION_FAILED: 'VAL_001',
	VALIDATION_EMAIL_EXISTS: 'VAL_002',
	VALIDATION_INVALID_TOKEN: 'VAL_003',
	VALIDATION_TOKEN_EXPIRED: 'VAL_004',
	VALIDATION_REQUIRED_FIELD: 'VAL_005',

	// Database errors (3xxx)
	DB_CONNECTION_FAILED: 'DB_001',
	DB_QUERY_FAILED: 'DB_002',
	DB_RECORD_NOT_FOUND: 'DB_003',
	DB_DUPLICATE_ENTRY: 'DB_004',

	// External service errors (4xxx)
	SERVICE_EMAIL_FAILED: 'SVC_001',
	SERVICE_CLOUDINARY_FAILED: 'SVC_002',
	SERVICE_GOOGLE_AUTH_FAILED: 'SVC_003',

	// File/Upload errors (5xxx)
	UPLOAD_NO_FILE: 'UPL_001',
	UPLOAD_INVALID_TYPE: 'UPL_002',
	UPLOAD_SIZE_EXCEEDED: 'UPL_003',
	UPLOAD_FAILED: 'UPL_004',

	// General errors (9xxx)
	INTERNAL_ERROR: 'ERR_001',
	RATE_LIMITED: 'ERR_002',
	NOT_FOUND: 'ERR_003',
	FORBIDDEN: 'ERR_004',
} as const

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode]

// User-friendly error messages
const errorMessages: Record<ErrorCodeType, string> = {
	// Authentication
	[ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please check your credentials and try again.',
	[ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email before signing in. Check your inbox for the verification link.',
	[ErrorCode.AUTH_ACCOUNT_DEACTIVATED]: 'Your account has been deactivated. Please contact support for assistance.',
	[ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
	[ErrorCode.AUTH_UNAUTHORIZED]: 'You need to be signed in to access this resource.',
	[ErrorCode.AUTH_GOOGLE_SIGNIN_REQUIRED]: 'This account was created with Google. Please sign in with Google.',

	// Validation
	[ErrorCode.VALIDATION_FAILED]: 'Please check your input and try again.',
	[ErrorCode.VALIDATION_EMAIL_EXISTS]: 'An account with this email already exists. Try signing in instead.',
	[ErrorCode.VALIDATION_INVALID_TOKEN]: 'The verification link is invalid or has already been used.',
	[ErrorCode.VALIDATION_TOKEN_EXPIRED]: 'The verification link has expired. Please request a new one.',
	[ErrorCode.VALIDATION_REQUIRED_FIELD]: 'Please fill in all required fields.',

	// Database
	[ErrorCode.DB_CONNECTION_FAILED]: 'Unable to connect to the database. Please try again in a few moments.',
	[ErrorCode.DB_QUERY_FAILED]: 'An error occurred while processing your request. Please try again.',
	[ErrorCode.DB_RECORD_NOT_FOUND]: 'The requested resource was not found.',
	[ErrorCode.DB_DUPLICATE_ENTRY]: 'This record already exists in our system.',

	// External services
	[ErrorCode.SERVICE_EMAIL_FAILED]: 'Failed to send email. Please try again or contact support.',
	[ErrorCode.SERVICE_CLOUDINARY_FAILED]: 'Failed to process the image. Please try a different file.',
	[ErrorCode.SERVICE_GOOGLE_AUTH_FAILED]: 'Google authentication failed. Please try again.',

	// Upload
	[ErrorCode.UPLOAD_NO_FILE]: 'Please select a file to upload.',
	[ErrorCode.UPLOAD_INVALID_TYPE]: 'Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).',
	[ErrorCode.UPLOAD_SIZE_EXCEEDED]: 'File is too large. Maximum size is 5MB.',
	[ErrorCode.UPLOAD_FAILED]: 'Failed to upload the file. Please try again.',

	// General
	[ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Our team has been notified.',
	[ErrorCode.RATE_LIMITED]: 'Too many requests. Please wait a moment before trying again.',
	[ErrorCode.NOT_FOUND]: 'The page or resource you requested was not found.',
	[ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
}

/**
 * Custom Application Error class
 */
export class AppError extends Error {
	public readonly code: ErrorCodeType
	public readonly statusCode: number
	public readonly isOperational: boolean
	public readonly details?: Record<string, unknown>

	constructor(
		code: ErrorCodeType,
		statusCode: number = 500,
		details?: Record<string, unknown>,
		isOperational: boolean = true
	) {
		super(errorMessages[code])
		this.code = code
		this.statusCode = statusCode
		this.isOperational = isOperational
		this.details = details

		// Maintains proper stack trace
		Error.captureStackTrace(this, this.constructor)
	}

	toJSON() {
		return {
			error: this.message,
			code: this.code,
			...(process.env.NODE_ENV === 'development' && this.details ? { details: this.details } : {}),
		}
	}
}

/**
 * Error factory functions for common scenarios
 */
export const createError = {
	// Authentication errors
	invalidCredentials: () =>
		new AppError(ErrorCode.AUTH_INVALID_CREDENTIALS, 401),

	emailNotVerified: () =>
		new AppError(ErrorCode.AUTH_EMAIL_NOT_VERIFIED, 403),

	accountDeactivated: () =>
		new AppError(ErrorCode.AUTH_ACCOUNT_DEACTIVATED, 403),

	sessionExpired: () =>
		new AppError(ErrorCode.AUTH_SESSION_EXPIRED, 401),

	unauthorized: () =>
		new AppError(ErrorCode.AUTH_UNAUTHORIZED, 401),

	googleSignInRequired: () =>
		new AppError(ErrorCode.AUTH_GOOGLE_SIGNIN_REQUIRED, 400),

	// Validation errors
	validationFailed: (details?: Record<string, unknown>) =>
		new AppError(ErrorCode.VALIDATION_FAILED, 400, details),

	emailExists: () =>
		new AppError(ErrorCode.VALIDATION_EMAIL_EXISTS, 409),

	invalidToken: () =>
		new AppError(ErrorCode.VALIDATION_INVALID_TOKEN, 400),

	tokenExpired: () =>
		new AppError(ErrorCode.VALIDATION_TOKEN_EXPIRED, 400),

	// Database errors
	connectionFailed: (details?: Record<string, unknown>) =>
		new AppError(ErrorCode.DB_CONNECTION_FAILED, 503, details),

	notFound: (resource?: string) =>
		new AppError(ErrorCode.DB_RECORD_NOT_FOUND, 404, { resource }),

	duplicateEntry: () =>
		new AppError(ErrorCode.DB_DUPLICATE_ENTRY, 409),

	// Service errors
	emailFailed: (details?: Record<string, unknown>) =>
		new AppError(ErrorCode.SERVICE_EMAIL_FAILED, 502, details),

	cloudinaryFailed: (details?: Record<string, unknown>) =>
		new AppError(ErrorCode.SERVICE_CLOUDINARY_FAILED, 502, details),

	// Upload errors
	noFile: () =>
		new AppError(ErrorCode.UPLOAD_NO_FILE, 400),

	invalidFileType: () =>
		new AppError(ErrorCode.UPLOAD_INVALID_TYPE, 400),

	fileTooLarge: () =>
		new AppError(ErrorCode.UPLOAD_SIZE_EXCEEDED, 400),

	uploadFailed: (details?: Record<string, unknown>) =>
		new AppError(ErrorCode.UPLOAD_FAILED, 500, details),

	// General errors
	internal: (details?: Record<string, unknown>) =>
		new AppError(ErrorCode.INTERNAL_ERROR, 500, details),

	forbidden: () =>
		new AppError(ErrorCode.FORBIDDEN, 403),

	rateLimited: () =>
		new AppError(ErrorCode.RATE_LIMITED, 429),
}

/**
 * Parse error from various sources into AppError
 */
export function parseError(error: unknown): AppError {
	// Already an AppError
	if (error instanceof AppError) {
		return error
	}

	// MongoDB duplicate key error
	if (
		error instanceof Error &&
		'code' in error &&
		(error as { code: number }).code === 11000
	) {
		return createError.duplicateEntry()
	}

	// MongoDB connection error
	if (
		error instanceof Error &&
		(error.message.includes('ECONNREFUSED') ||
			error.message.includes('ETIMEDOUT') ||
			error.message.includes('querySrv ENOTFOUND') ||
			error.message.includes('whitelist'))
	) {
		return createError.connectionFailed({
			originalError: error.message,
		})
	}

	// Zod validation error
	if (error instanceof Error && error.name === 'ZodError') {
		return createError.validationFailed({
			originalError: error.message,
		})
	}

	// Generic Error
	if (error instanceof Error) {
		return new AppError(ErrorCode.INTERNAL_ERROR, 500, {
			originalError: process.env.NODE_ENV === 'development' ? error.message : undefined,
		})
	}

	// Unknown error type
	return createError.internal()
}

/**
 * Log error with appropriate level
 */
export function logError(error: AppError, context?: string): void {
	const logData = {
		code: error.code,
		message: error.message,
		statusCode: error.statusCode,
		context,
		details: error.details,
		stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		timestamp: new Date().toISOString(),
	}

	if (error.statusCode >= 500) {
		console.error('[ERROR]', JSON.stringify(logData, null, 2))
	} else {
		console.warn('[WARN]', JSON.stringify(logData, null, 2))
	}
}

/**
 * Format error response for API routes
 */
export function formatErrorResponse(error: unknown, context?: string) {
	const appError = parseError(error)
	logError(appError, context)

	return {
		body: appError.toJSON(),
		status: appError.statusCode,
	}
}
