import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User, type IUser } from '@/models/user'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			email: string
			name: string
			avatar?: string
			role: string
			isEmailVerified: boolean
			courseName?: string
			city?: string
			country?: string
			phone?: string
			whatsapp?: string
			linkedin?: string
			instagram?: string
			github?: string
			twitter?: string
			company?: string
			bio?: string
		}
	}

	interface User {
		id: string
		email: string
		name: string
		avatar?: string
		role: string
		isEmailVerified: boolean
		courseName?: string
		city?: string
		country?: string
		phone?: string
		whatsapp?: string
		linkedin?: string
		instagram?: string
		github?: string
		twitter?: string
		company?: string
		bio?: string
	}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			name: 'credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					if (!credentials?.email || !credentials?.password) {
						return null
					}

					await connectDB()

					const user = await User.findOne({
						email: (credentials.email as string).toLowerCase(),
					}).select('+password')

					if (!user) {
						return null
					}

					if (!user.password) {
						return null // Google account
					}

					const isPasswordValid = await bcrypt.compare(
						credentials.password as string,
						user.password
					)

					if (!isPasswordValid) {
						return null
					}

					if (!user.emailVerified) {
						// Custom handling for unverified email could be done by throwing
						// but let's stick to generic failure to avoid Configuration error for now
						// or we can chance throwing a specific string that matches our client map
						// BUT NextAuth v5 is strict. Let's return null to solve the immediate blocking issue.
						return null
					}

					if (!user.isActive) {
						return null
					}

					return {
						id: user._id.toString(),
						email: user.email,
						name: user.name,
						avatar: user.avatar,
						role: user.role,
						isEmailVerified: user.emailVerified,
						courseName: user.courseName,
						city: user.city,
						country: user.country,
						phone: user.phone,
						whatsapp: user.whatsapp,
						linkedin: user.linkedin,
						instagram: user.instagram,
						github: user.github,
						twitter: user.twitter,
						company: user.company,
						bio: user.bio,
					}
				} catch (error) {
					console.error('Auth error:', error)
					return null
				}
			},
		}),
		// Google({
		// 	clientId: process.env.GOOGLE_CLIENT_ID!,
		// 	clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		// }),
	],
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === 'google') {
				await connectDB()

				const existingUser = await User.findOne({ email: user.email })

				if (existingUser) {
					if (!existingUser.googleId) {
						await User.findByIdAndUpdate(existingUser._id, {
							googleId: account.providerAccountId,
							emailVerified: true,
						})
					}
					return true
				}

				// For new Google users, redirect to complete profile
				return `/complete-profile?email=${encodeURIComponent(user.email || '')}&name=${encodeURIComponent(user.name || '')}&googleId=${account.providerAccountId}&avatar=${encodeURIComponent(user.image || '')}`
			}

			return true
		},
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id
				token.role = user.role
				token.avatar = user.avatar
				token.isEmailVerified = user.isEmailVerified
				token.courseName = user.courseName
				token.city = user.city
				token.country = user.country
				token.phone = user.phone
				token.whatsapp = user.whatsapp
				token.linkedin = user.linkedin
				token.instagram = user.instagram
				token.github = user.github
				token.twitter = user.twitter
				token.company = user.company
				token.bio = user.bio
			}

			if (trigger === 'update' && session) {
				return { ...token, ...session }
			}

			return token
		},
		async session({ session, token }) {
			if (token) {
				session.user.id = token.id as string
				session.user.role = token.role as string
				session.user.avatar = token.avatar as string | undefined
				session.user.isEmailVerified = token.isEmailVerified as boolean
				session.user.courseName = token.courseName as string | undefined
				session.user.city = token.city as string | undefined
				session.user.country = token.country as string | undefined
				session.user.phone = token.phone as string | undefined
				session.user.whatsapp = token.whatsapp as string | undefined
				session.user.linkedin = token.linkedin as string | undefined
				session.user.instagram = token.instagram as string | undefined
				session.user.github = token.github as string | undefined
				session.user.twitter = token.twitter as string | undefined
				session.user.company = token.company as string | undefined
				session.user.bio = token.bio as string | undefined
			}

			return session
		},
	},
	pages: {
		signIn: '/login',
		error: '/login',
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET,
})
