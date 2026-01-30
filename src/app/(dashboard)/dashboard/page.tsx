import { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { User } from '@/models/user'
import { Photo } from '@/models/photo'
import { Users, Image, Camera, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const metadata: Metadata = {
	title: 'Dashboard',
}

async function getStats() {
	await connectDB()

	const [totalUsers, totalPhotos, recentUsers] = await Promise.all([
		User.countDocuments({ isActive: true }),
		Photo.countDocuments({ isPublic: true }),
		User.find({ isActive: true })
			.select('name avatar role')
			.sort({ createdAt: -1 })
			.limit(5)
			.lean(),
	])

	return { totalUsers, totalPhotos, recentUsers }
}

export default async function DashboardPage() {
	const session = await auth()
	const { totalUsers, totalPhotos, recentUsers } = await getStats()

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	return (
		<div className="space-y-8">
			{/* Welcome Section */}
			<div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
				<h1 className="text-3xl font-bold mb-2">
					Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
				</h1>
				<p className="text-blue-100 text-lg">
					Connect with your IBS London classmates and share your memories.
				</p>
			</div>

			{/* Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Classmates
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUsers}</div>
						<p className="text-xs text-muted-foreground">
							Registered participants
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Photos Shared</CardTitle>
						<Image className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalPhotos}</div>
						<p className="text-xs text-muted-foreground">
							Memories from London
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
						<Camera className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent className="space-y-2">
						<Link href="/gallery">
							<Button variant="outline" className="w-full justify-start text-sm">
								<Camera className="mr-2 h-4 w-4" />
								Upload a photo
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>

			{/* Recent Members */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Recent Members</CardTitle>
					<Link href="/colleagues">
						<Button variant="ghost" size="sm">
							View all
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</CardHeader>
				<CardContent>
					{recentUsers.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">
							No members yet. Be the first!
						</p>
					) : (
						<div className="flex flex-wrap gap-4">
							{recentUsers.map((user) => (
								<Link
									key={user._id.toString()}
									href={`/colleagues/${user._id}`}
									className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
								>
									<Avatar>
										<AvatarImage src={user.avatar} alt={user.name} />
										<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium text-sm">{user.name}</p>
										<p className="text-xs text-muted-foreground capitalize">
											{user.role}
										</p>
									</div>
								</Link>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
