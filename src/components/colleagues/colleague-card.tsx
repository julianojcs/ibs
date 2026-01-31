import Link from 'next/link'
import { MapPin, Phone, Linkedin, Instagram, Github, Mail, Twitter, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface IUser {
	_id: string
	email: string
	name: string
	avatar?: string
	role: string
	courseName: string
	city: string
	country: string
	phone?: string
	whatsapp?: string
	linkedin?: string
	instagram?: string
	github?: string
	twitter?: string
	bio?: string
	emailVerified: boolean
}

interface ColleagueCardProps {
	colleague: IUser
}

const roleColors: Record<string, string> = {
	student: 'bg-blue-500/10 text-blue-500',
	teacher: 'bg-purple-500/10 text-purple-500',
	advisor: 'bg-green-500/10 text-green-500',
	coordinator: 'bg-orange-500/10 text-orange-500',
	guest: 'bg-gray-500/10 text-gray-500',
}

export function ColleagueCard({ colleague }: ColleagueCardProps) {
	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	return (
		<Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
			<CardContent className="p-6">
				<div className="flex flex-col items-center text-center">
					<Link href={`/colleagues/${colleague._id}`} className="block">
						<Avatar className="h-24 w-24 mb-4 ring-2 ring-offset-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
							<AvatarImage src={colleague.avatar} alt={colleague.name} />
							<AvatarFallback className="text-2xl bg-primary/10">
								{getInitials(colleague.name)}
							</AvatarFallback>
						</Avatar>
					</Link>

					<Link href={`/colleagues/${colleague._id}`}>
						<h3 className="font-semibold text-lg hover:text-primary transition-colors">
							{colleague.name}
						</h3>
					</Link>

					<Badge className={`mt-2 ${roleColors[colleague.role] || roleColors.guest}`}>
						{colleague.role.charAt(0).toUpperCase() + colleague.role.slice(1)}
					</Badge>

					<p className="text-sm text-muted-foreground mt-2">
						{colleague.courseName}
					</p>

					{colleague.bio && (
						<p className="text-sm mt-3 line-clamp-3 text-muted-foreground italic px-4 py-2 bg-muted/30 rounded-lg w-full">
							&quot;{colleague.bio}&quot;
						</p>
					)}

					<div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
						<MapPin className="h-3 w-3" />
						<span>
							{colleague.city}, {colleague.country}
						</span>
					</div>

					<div className="flex items-center gap-2 mt-4">
						{colleague.email && (
							<div className="relative">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
									asChild
								>
									<a
										href={`mailto:${colleague.email}`}
										aria-label="Send email"
										tabIndex={0}
									>
										<Mail className="h-4 w-4" />
									</a>
								</Button>
								<div className="absolute -top-1 -right-1">
									{colleague.emailVerified ? (
										<CheckCircle2 className="h-3 w-3 text-green-500 fill-white" />
									) : (
										<AlertCircle className="h-3 w-3 text-amber-500 fill-white" />
									)}
								</div>
							</div>
						)}

						{colleague.whatsapp && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
								asChild
							>
								<a
									href={`https://wa.me/${colleague.whatsapp.replace(/\D/g, '')}`}
									target="_blank"
									rel="noopener noreferrer"
									title="WhatsApp"
									aria-label="Chat on WhatsApp"
									tabIndex={0}
								>
									<MessageCircle className="h-4 w-4" />
								</a>
							</Button>
						)}

						{colleague.linkedin && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
								asChild
							>
								<a
									href={colleague.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="LinkedIn profile"
									tabIndex={0}
								>
									<Linkedin className="h-4 w-4" />
								</a>
							</Button>
						)}

						{colleague.instagram && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/30"
								asChild
							>
								<a
									href={`https://instagram.com/${colleague.instagram.replace('@', '')}`}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Instagram profile"
									tabIndex={0}
								>
									<Instagram className="h-4 w-4" />
								</a>
							</Button>
						)}

						{colleague.twitter && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/30"
								asChild
							>
								<a
									href={`https://x.com/${colleague.twitter.replace('@', '')}`}
									target="_blank"
									rel="noopener noreferrer"
									title="X (Twitter) profile"
									aria-label="X profile"
									tabIndex={0}
								>
									<Twitter className="h-4 w-4" />
								</a>
							</Button>
						)}

						{colleague.github && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
								asChild
							>
								<a
									href={colleague.github}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="GitHub profile"
									tabIndex={0}
								>
									<Github className="h-4 w-4" />
								</a>
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
