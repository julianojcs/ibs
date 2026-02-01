'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { X, UserCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'ibs_profile_banner_dismissed'

export function ProfileCompletionBanner() {
	const { data: session } = useSession()
	const router = useRouter()
	const [isDismissed, setIsDismissed] = useState(false)
	const [isClient, setIsClient] = useState(false)

	// Ensure we're on client side
	useEffect(() => {
		setIsClient(true)

		// Check localStorage for permanent dismissal
		if (typeof window !== 'undefined') {
			const dismissed = localStorage.getItem(STORAGE_KEY)
			if (dismissed === 'true') {
				setIsDismissed(true)
			}
		}
	}, [])

	// Don't show if not on client yet, session not loaded, or dismissed
	if (!isClient || !session?.user || isDismissed) {
		return null
	}

	// Calculate completion from session social fields directly (more reliable than profileCompleted flag)
	const socialFields = ['linkedin', 'instagram', 'twitter', 'whatsapp', 'github'] as const
	const filledCount = socialFields.filter((field) => {
		const value = session.user[field]
		return value && value.trim() !== ''
	}).length

	// Profile is complete if user has 2+ social fields filled
	const isProfileComplete = filledCount >= 2

	// If profile is complete, permanently dismiss and don't show
	if (isProfileComplete) {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, 'true')
		}
		return null
	}

	const percentage = Math.round((filledCount / socialFields.length) * 100)

	const handleDismiss = () => {
		// Permanently dismiss using localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, 'true')
		}
		setIsDismissed(true)
	}

	return (
		<div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6 relative">
			<button
				onClick={handleDismiss}
				className="absolute top-3 right-3 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
				aria-label="Dismiss banner"
			>
				<X className="h-5 w-5" />
			</button>

			<div className="flex items-start gap-4">
				<div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-800/50 rounded-full">
					<UserCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
				</div>

				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-amber-900 dark:text-amber-100 text-lg">
						Complete your profile to connect with classmates!
					</h3>
					<p className="text-amber-700 dark:text-amber-300 mt-1 text-sm">
						Share your social links so your IBS London colleagues can find and connect with you.
						Your profile is currently <strong>{percentage}%</strong> complete.
					</p>

					{/* Progress bar */}
					<div className="mt-3 mb-4">
						<div className="h-2 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 transition-all duration-300"
								style={{ width: `${percentage}%` }}
							/>
						</div>
						<p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
							Add at least 2 social links to complete your profile
						</p>
					</div>

					<Button
						onClick={() => router.push('/profile')}
						className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
					>
						Complete Profile
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	)
}
