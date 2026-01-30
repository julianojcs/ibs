import mongoose from 'mongoose'

interface MongooseCache {
	conn: typeof mongoose | null
	promise: Promise<typeof mongoose> | null
}

declare global {
	// eslint-disable-next-line no-var
	var mongoose: MongooseCache | undefined
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
	throw new Error(
		'Please define the MONGODB_URI environment variable inside .env.local'
	)
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
	global.mongoose = cached
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Uses connection caching to reuse existing connections in serverless environments.
 * @returns Promise resolving to the Mongoose instance
 */
export async function connectDB(): Promise<typeof mongoose> {
	if (cached.conn) {
		return cached.conn
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		}

		cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
			return mongoose
		})
	}

	try {
		cached.conn = await cached.promise
	} catch (err) {
		cached.promise = null
		throw err
	}

	return cached.conn
}

export default connectDB
