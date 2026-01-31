'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

/**
 * Hook that redirects users with incomplete profiles to the profile page
 * Only redirects on first visit after login (uses sessionStorage to track)
 */
export function useProfileCompletionRedirect() {
	const { data: session, status } = useSession()
	const router = useRouter()
	const pathname = usePathname()
	const [hasChecked, setHasChecked] = useState(false)

	useEffect(() => {
		// Only run on client side and when session is loaded
		if (typeof window === 'undefined' || status !== 'authenticated' || hasChecked) {
			return
		}

		// Don't redirect if already on profile page
		if (pathname === '/profile') {
			setHasChecked(true)
			return
		}

		// Check if we've already shown the redirect this session
		const hasSeenProfilePrompt = sessionStorage.getItem('ibs_profile_prompt_shown')
		if (hasSeenProfilePrompt) {
			setHasChecked(true)
			return
		}

		// Check if profile is incomplete
		if (session?.user && !session.user.profileCompleted) {
			// Mark that we've shown the prompt this session
			sessionStorage.setItem('ibs_profile_prompt_shown', 'true')

			// Redirect to profile page with onboarding flag
			router.push('/profile?onboarding=true')
		}

		setHasChecked(true)
	}, [session, status, router, pathname, hasChecked])
}
