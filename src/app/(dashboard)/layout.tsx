import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { DashboardContent } from '@/components/layout/dashboard-content'

interface DashboardLayoutProps {
	children: React.ReactNode
}

export default async function DashboardLayout({
	children,
}: DashboardLayoutProps) {
	const session = await auth()

	if (!session?.user) {
		redirect('/login')
	}

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Header />
			<main className="container mx-auto px-4 py-8 flex-1">
				<DashboardContent>{children}</DashboardContent>
			</main>
			<Footer />
		</div>
	)
}
