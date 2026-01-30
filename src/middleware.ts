import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/verify-email', '/reset-password', '/complete-profile']

export default async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl

	// Allow public routes
	if (publicRoutes.some((route) => pathname === route || pathname.startsWith('/api/auth'))) {
		return NextResponse.next()
	}

	const session = await auth()

	// Redirect to login if not authenticated
	if (!session?.user) {
		const loginUrl = new URL('/login', req.url)
		loginUrl.searchParams.set('callbackUrl', pathname)
		return NextResponse.redirect(loginUrl)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
	runtime: 'nodejs',
}
