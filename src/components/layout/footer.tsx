import Link from 'next/link'
import { Linkedin } from 'lucide-react'

export function Footer() {
	const currentYear = new Date().getFullYear()

	return (
		<footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 py-6">
				<div className="flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>© {currentYear} IBS London. All rights reserved.</span>
					</div>

					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>Developed by</span>
						<Link
							href="https://www.linkedin.com/in/julianocsilva/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors"
						>
							Juliano Costa Silva
							<Linkedin className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
