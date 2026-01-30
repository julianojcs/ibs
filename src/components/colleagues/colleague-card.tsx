import Link from 'next/link'
import { MapPin, Phone, Linkedin, Instagram, Github, Mail } from 'lucide-react'
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
	courseNumber: string
	city: string
	country: string
	phone?: string
	whatsapp?: string
	linkedin?: string
	instagram?: string
	github?: string
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
						{colleague.courseNumber}
					</p>

					<div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
						<MapPin className="h-3 w-3" />
						<span>
							{colleague.city}, {colleague.country}
						</span>
					</div>

					<div className="flex items-center gap-2 mt-4">
						{colleague.email && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
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
						)}

						{colleague.whatsapp && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								asChild
							>
								<a
									href={`https://wa.me/${colleague.whatsapp.replace(/\D/g, '')}`}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="WhatsApp"
									tabIndex={0}
								>
									<Phone className="h-4 w-4" />
								</a>
							</Button>
						)}

						{colleague.linkedin && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
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
								className="h-8 w-8"
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

						{colleague.github && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
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
