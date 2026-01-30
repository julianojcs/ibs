import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: {
		default: 'IBS London - Classmate Registration',
		template: '%s | IBS London',
	},
	description:
		'Registration system for IBS Americas classmates from the London course. Connect with your colleagues, share memories, and stay in touch.',
	keywords: ['IBS Americas', 'London', 'classmates', 'registration', 'networking'],
}

interface RootLayoutProps {
	children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
			>
				<Providers>
					{children}
					<Toaster position="top-right" richColors />
				</Providers>
			</body>
		</html>
	)
}
