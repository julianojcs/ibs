import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users, Image, MapPin } from 'lucide-react'

export default async function HomePage() {
	const session = await auth()

	if (session?.user) {
		redirect('/dashboard')
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
			<div className="container mx-auto px-4">
				{/* Header */}
				<header className="flex items-center justify-between py-6">
					<h1 className="text-2xl font-bold text-white">IBS London</h1>
					<div className="flex items-center gap-4">
						<Link href="/login">
							<Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
								Sign in
							</Button>
						</Link>
						<Link href="/register">
							<Button className="bg-white text-slate-900 hover:bg-white/90">
								Get started
							</Button>
						</Link>
					</div>
				</header>

				{/* Hero */}
				<main className="py-20 md:py-32">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
							Connect with your
							<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
								{' '}
								IBS London{' '}
							</span>
							classmates
						</h2>
						<p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
							Stay connected with fellow participants from your IBS Americas
							course in London. Share memories, network, and build lasting
							relationships.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link href="/register">
								<Button
									size="lg"
									className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8"
								>
									Join now
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
							</Link>
							<Link href="/login">
								<Button
									size="lg"
									variant="outline"
									className="border-white/20 text-white hover:bg-white/10"
								>
									I already have an account
								</Button>
							</Link>
						</div>
					</div>
				</main>

				{/* Features */}
				<section className="py-20 border-t border-white/10">
					<div className="grid md:grid-cols-3 gap-8">
						<div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm">
							<div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
								<Users className="h-6 w-6 text-blue-400" />
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Find classmates
							</h3>
							<p className="text-slate-400">
								Browse profiles and connect with colleagues from your course.
								Filter by city, country, or role.
							</p>
						</div>

						<div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm">
							<div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cyan-500/20 flex items-center justify-center">
								<Image className="h-6 w-6 text-cyan-400" />
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Share memories
							</h3>
							<p className="text-slate-400">
								Upload and share photos from your London experience. Tag
								classmates and relive the memories.
							</p>
						</div>

						<div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm">
							<div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
								<MapPin className="h-6 w-6 text-purple-400" />
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								Stay in touch
							</h3>
							<p className="text-slate-400">
								Find contact information, social profiles, and keep building
								your professional network.
							</p>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="py-8 border-t border-white/10 text-center text-slate-400 text-sm">
					<p>© {new Date().getFullYear()} IBS London. All rights reserved.</p>
				</footer>
			</div>
		</div>
	)
}
