import { Schema, model, models, Document, Types } from 'mongoose'
import { USER_ROLES, type UserRole } from '@/lib/constants'

/**
 * User document interface for MongoDB
 */
export interface IUser extends Document {
	_id: Types.ObjectId
	email: string
	password?: string
	emailVerified: boolean
	verificationToken?: string
	verificationTokenExpires?: Date
	resetPasswordToken?: string
	resetPasswordTokenExpires?: Date
	name: string
	avatar?: string
	role: UserRole
	courseName: string
	city: string
	country: string
	whatsapp?: string
	linkedin?: string
	instagram?: string
	github?: string
	twitter?: string
	bio?: string
	company?: string
	googleId?: string
	isActive: boolean
	profileCompleted: boolean
	createdAt: Date
	updatedAt: Date
}

/**
 * User schema for MongoDB with Mongoose
 */
const UserSchema = new Schema<IUser>(
	{
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			select: false,
		},
		emailVerified: {
			type: Boolean,
			default: false,
		},
		verificationToken: {
			type: String,
			select: false,
		},
		verificationTokenExpires: {
			type: Date,
			select: false,
		},
		resetPasswordToken: {
			type: String,
			select: false,
		},
		resetPasswordTokenExpires: {
			type: Date,
			select: false,
		},
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
		},
		avatar: {
			type: String,
		},
		role: {
			type: String,
			enum: Object.values(USER_ROLES),
			default: USER_ROLES.STUDENT,
		},
		courseName: {
			type: String,
			required: [true, 'Course name is required'],
		},
		city: {
			type: String,
			required: [true, 'City is required'],
		},
		country: {
			type: String,
			required: [true, 'Country is required'],
		},
		whatsapp: {
			type: String,
		},
		linkedin: {
			type: String,
		},
		instagram: {
			type: String,
		},
		github: {
			type: String,
		},
		twitter: {
			type: String,
		},
		bio: {
			type: String,
			maxlength: [500, 'Mini Bio cannot exceed 500 characters'],
		},
		company: {
			type: String,
			trim: true,
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		profileCompleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
)

// Note: email index is already created by unique: true
// googleId index is already created by unique: true, sparse: true
UserSchema.index({ courseName: 1 })
UserSchema.index({ country: 1, city: 1 })
UserSchema.index({ name: 'text' })

export const User = models.User || model<IUser>('User', UserSchema)
