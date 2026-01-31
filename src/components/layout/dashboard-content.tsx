'use client'

import { ProfileCompletionBanner } from './profile-completion-banner'
import { useProfileCompletionRedirect } from '@/hooks/use-profile-completion-redirect'

interface DashboardContentProps {
	children: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
	// Redirect users with incomplete profiles on first visit
	useProfileCompletionRedirect()

	return (
		<>
			<ProfileCompletionBanner />
			{children}
		</>
	)
}
