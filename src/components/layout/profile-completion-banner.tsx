'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { X, UserCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ProfileCompletionBanner() {
	const { data: session } = useSession()
	const router = useRouter()
	const [isDismissed, setIsDismissed] = useState(false)

	// Don't show banner if:
	// - Session not loaded
	// - Profile is already completed
	// - Banner was dismissed this session
	if (!session?.user || session.user.profileCompleted || isDismissed) {
		return null
	}

	// Calculate completion percentage for display
	const socialFields = ['linkedin', 'instagram', 'twitter', 'whatsapp', 'github'] as const
	const filledCount = socialFields.filter((field) => {
		const value = session.user[field]
		return value && value.trim() !== ''
	}).length
	const percentage = Math.round((filledCount / socialFields.length) * 100)

	return (
		<div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6 relative">
			<button
				onClick={() => setIsDismissed(true)}
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
