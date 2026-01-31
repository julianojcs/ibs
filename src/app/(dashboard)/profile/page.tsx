'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Camera, Save, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { profileSchema, type ProfileFormData } from '@/lib/validations'
import { USER_ROLES, COUNTRIES } from '@/lib/constants'

export default function ProfilePage() {
	const { data: session, update } = useSession()
	const [isLoading, setIsLoading] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const [courses, setCourses] = useState<{ name: string; code: string }[]>([])
	const [isFetchingCourses, setIsFetchingCourses] = useState(true)
	const [showOnboardingBanner, setShowOnboardingBanner] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const searchParams = useSearchParams()

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: session?.user?.name || '',
			email: session?.user?.email || '',
			role: (session?.user?.role as ProfileFormData['role']) || 'student',
			courseName: session?.user?.courseName || '',
			city: session?.user?.city || '',
			country: session?.user?.country || '',
			whatsapp: session?.user?.whatsapp || '',
			linkedin: session?.user?.linkedin || '',
			instagram: session?.user?.instagram || '',
			github: session?.user?.github || '',
			twitter: session?.user?.twitter || '',
			company: session?.user?.company || '',
			bio: session?.user?.bio || '',
		},
	})

	const selectedRole = watch('role')
	const selectedCourse = watch('courseName')
	const selectedCountry = watch('country')

	// Update form values when session is loaded
	useEffect(() => {
		if (session?.user) {
			reset({
				name: session.user.name || '',
				email: session.user.email || '',
				role: (session.user.role as ProfileFormData['role']) || 'student',
				courseName: session.user.courseName || '',
				city: session.user.city || '',
				country: session.user.country || '',
				whatsapp: session.user.whatsapp || '',
				linkedin: session.user.linkedin || '',
				instagram: session.user.instagram || '',
				github: session.user.github || '',
				twitter: session.user.twitter || '',
				company: session.user.company || '',
				bio: session.user.bio || '',
			})
		}
	}, [session, reset])

	// Check for onboarding parameter
	useEffect(() => {
		if (searchParams.get('onboarding') === 'true') {
			setShowOnboardingBanner(true)
			// Clean up URL without triggering navigation
			window.history.replaceState({}, '', '/profile')
		}
	}, [searchParams])

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const response = await fetch('/api/courses')
				if (response.ok) {
					const data = await response.json()
					setCourses(data)
				}
			} catch (error) {
				console.error('Failed to fetch courses:', error)
			} finally {
				setIsFetchingCourses(false)
			}
		}
		fetchCourses()
	}, [])

	const formatPhoneNumber = (value: string) => {
		// Ensure it starts with +
		let cleaned = value.replace(/[^\d+]/g, '')
		if (cleaned && !cleaned.startsWith('+')) {
			cleaned = '+' + cleaned
		}

		// Apply a general international format: +XX (XX) XXXXX-XXXX
		// This is a bit tricky for all countries, but we'll try to follow a common pattern
		const digits = cleaned.replace(/\D/g, '')

		if (digits.length <= 2) return cleaned

		let formatted = '+' + digits.substring(0, 2)
		if (digits.length > 2) {
			formatted += ' (' + digits.substring(2, 4)
		}
		if (digits.length > 4) {
			formatted += ') ' + digits.substring(4, 9)
		}
		if (digits.length > 9) {
			formatted += '-' + digits.substring(9, 13)
		}

		return formatted.substring(0, 19)
	}

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhoneNumber(e.target.value)
		setValue('whatsapp', formatted, { shouldValidate: true })
	}

	const handleAvatarClick = () => {
		fileInputRef.current?.click()
	}

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
			toast.error('Please select a valid image file (JPEG, PNG, or WebP)')
			return
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be less than 5MB')
			return
		}

		setAvatarPreview(URL.createObjectURL(file))
		setIsUploading(true)

		try {
			const formData = new FormData()
			formData.append('file', file)
			formData.append('type', 'avatar')

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || 'Upload failed')
			}

			const result = await response.json()
			await update({ avatar: result.url })
			toast.success('Avatar updated successfully!')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to upload avatar')
			setAvatarPreview(null)
		} finally {
			setIsUploading(false)
		}
	}

	const handleFormSubmit = async (data: ProfileFormData) => {
		if (!session?.user?.id) return

		setIsLoading(true)

		try {
			const response = await fetch(`/api/users/${session.user.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || 'Update failed')
			}

			await update({
				name: data.name,
				email: data.email,
				role: data.role,
				courseName: data.courseName,
				city: data.city,
				country: data.country,
				whatsapp: data.whatsapp,
				linkedin: data.linkedin,
				instagram: data.instagram,
				github: data.github,
				twitter: data.twitter,
				company: data.company,
				bio: data.bio,
				profileCompleted: result.user?.profileCompleted ?? false,
			})

			toast.success('Profile updated successfully!')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to update profile')
		} finally {
			setIsLoading(false)
		}
	}

	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Profile</h1>
				<p className="text-muted-foreground">
					Manage your account settings and public profile
				</p>
			</div>

			{/* Onboarding Welcome Banner */}
			{showOnboardingBanner && (
				<div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white relative">
					<button
						onClick={() => setShowOnboardingBanner(false)}
						className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
						aria-label="Close banner"
					>
						<X className="h-5 w-5" />
					</button>
					<div className="flex items-start gap-4">
						<div className="flex-shrink-0 p-2 bg-white/20 rounded-full">
							<Sparkles className="h-8 w-8" />
						</div>
						<div>
							<h2 className="text-xl font-bold mb-2">
								Welcome to IBS London! 🎉
							</h2>
							<p className="text-blue-100">
								Complete your profile by adding your social links so your classmates can connect with you.
								Share at least <strong>2 social links</strong> (LinkedIn, Instagram, WhatsApp, X, or GitHub) to unlock the full experience!
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Avatar Section */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Photo</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center gap-6">
					<div className="relative">
						<Avatar className="h-24 w-24">
							<AvatarImage
								src={avatarPreview || session?.user?.avatar}
								alt={session?.user?.name}
							/>
							<AvatarFallback className="text-2xl">
								{getInitials(session?.user?.name || '')}
							</AvatarFallback>
						</Avatar>
						{isUploading && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
								<Loader2 className="h-6 w-6 animate-spin text-white" />
							</div>
						)}
					</div>
					<div>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleAvatarChange}
							accept="image/jpeg,image/png,image/webp"
							className="hidden"
						/>
						<Button
							variant="outline"
							onClick={handleAvatarClick}
							disabled={isUploading}
						>
							<Camera className="mr-2 h-4 w-4" />
							Change photo
						</Button>
						<p className="text-xs text-muted-foreground mt-2">
							JPG, PNG or WebP. Max 5MB.
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Profile Form */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2 space-y-2">
								<Label htmlFor="name">Full Name</Label>
								<Input id="name" {...register('name')} disabled={isLoading} />
								{errors.name && (
									<p className="text-sm text-destructive">
										{errors.name.message}
									</p>
								)}
							</div>

							<div className="col-span-2 space-y-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="email">Email Address</Label>
									{session?.user?.isEmailVerified ? (
										<div className="flex items-center gap-1 text-xs text-green-600 font-medium">
											<CheckCircle2 className="h-3 w-3" />
											<span>Verified</span>
										</div>
									) : (
										<div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
											<AlertCircle className="h-3 w-3" />
											<span>Unverified</span>
										</div>
									)}
								</div>
								<Input id="email" type="email" {...register('email')} disabled={isLoading} />
								{errors.email && (
									<p className="text-sm text-destructive">
										{errors.email.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="role">Role</Label>
								<Select
									value={selectedRole}
									onValueChange={(value) =>
										setValue('role', value as ProfileFormData['role'])
									}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select role" />
									</SelectTrigger>
									<SelectContent>
										{Object.values(USER_ROLES).map((role) => (
											<SelectItem key={role} value={role}>
												{role.charAt(0).toUpperCase() + role.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.role && (
									<p className="text-sm text-destructive">
										{errors.role.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="company">Company / Current Job</Label>
								<Input
									id="company"
									placeholder="e.g., Google, Freelancer, etc."
									{...register('company')}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="courseName">Course Name</Label>
								<Select
									value={selectedCourse}
									onValueChange={(value) => setValue('courseName', value, { shouldValidate: true })}
									disabled={isLoading || isFetchingCourses}
								>
									<SelectTrigger>
										<SelectValue placeholder={isFetchingCourses ? "Loading courses..." : "Select course"}>
											{selectedCourse ? (courses.find(c => c.name === selectedCourse)?.code || selectedCourse) : null}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{courses.length > 0 ? (
											courses.map((course) => (
												<SelectItem key={course.code} value={course.name} textValue={course.code}>
													{course.name}
												</SelectItem>
											))
										) : (
											<SelectItem value="_empty" disabled>
												{isFetchingCourses ? "Loading..." : "No courses available"}
											</SelectItem>
										)}
									</SelectContent>
								</Select>
								{errors.courseName && (
									<p className="text-sm text-destructive">
										{errors.courseName.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									{...register('city')}
									disabled={isLoading}
								/>
								{errors.city && (
									<p className="text-sm text-destructive">
										{errors.city.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="country">Country</Label>
								<Select
									value={selectedCountry}
									onValueChange={(value) => setValue('country', value)}
									disabled={isLoading}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select country" />
									</SelectTrigger>
									<SelectContent>
										{COUNTRIES.map((country) => (
											<SelectItem key={country} value={country}>
												{country}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.country && (
									<p className="text-sm text-destructive">
										{errors.country.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="whatsapp">WhatsApp (with DDI)</Label>
								<Input
									id="whatsapp"
									placeholder="+55 (11) 99999-9999"
									{...register('whatsapp')}
									onChange={(e) => handlePhoneChange(e)}
									disabled={isLoading}
								/>
							</div>

							<div className="col-span-2 space-y-2">
								<Label htmlFor="linkedin">LinkedIn URL</Label>
								<Input
									id="linkedin"
									placeholder="https://linkedin.com/in/yourprofile"
									{...register('linkedin')}
									disabled={isLoading}
								/>
								{errors.linkedin && (
									<p className="text-sm text-destructive">
										{errors.linkedin.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="instagram">Instagram</Label>
								<Input
									id="instagram"
									placeholder="@username"
									{...register('instagram')}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="twitter">X (Twitter)</Label>
								<Input
									id="twitter"
									placeholder="@username"
									{...register('twitter')}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="github">GitHub URL</Label>
								<Input
									id="github"
									placeholder="https://github.com/username"
									{...register('github')}
									disabled={isLoading}
								/>
								{errors.github && (
									<p className="text-sm text-destructive">
										{errors.github.message}
									</p>
								)}
							</div>

							<div className="col-span-2 space-y-2">
								<Label htmlFor="bio">Mini Bio</Label>
								<textarea
									id="bio"
									rows={4}
									className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
									placeholder="Tell us a bit about yourself..."
									{...register('bio')}
									disabled={isLoading}
								/>
								{errors.bio && (
									<p className="text-sm text-destructive">
										{errors.bio.message}
									</p>
								)}
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="mr-2 h-4 w-4" />
									Save changes
								</>
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
