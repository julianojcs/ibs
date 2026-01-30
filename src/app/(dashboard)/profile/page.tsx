'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Camera, Save } from 'lucide-react'
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
import { USER_ROLES } from '@/lib/constants'

export default function ProfilePage() {
	const { data: session, update } = useSession()
	const [isLoading, setIsLoading] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<ProfileFormData>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: session?.user?.name || '',
			role: (session?.user?.role as ProfileFormData['role']) || 'student',
			courseNumber: '',
			city: '',
			country: '',
			phone: '',
			whatsapp: '',
			linkedin: '',
			instagram: '',
			github: '',
		},
	})

	const selectedRole = watch('role')

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
				role: data.role,
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
								<Label htmlFor="courseNumber">Course Number</Label>
								<Input
									id="courseNumber"
									placeholder="e.g., IBS-2025-1"
									{...register('courseNumber')}
									disabled={isLoading}
								/>
								{errors.courseNumber && (
									<p className="text-sm text-destructive">
										{errors.courseNumber.message}
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
								<Input
									id="country"
									{...register('country')}
									disabled={isLoading}
								/>
								{errors.country && (
									<p className="text-sm text-destructive">
										{errors.country.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">Phone (with DDI)</Label>
								<Input
									id="phone"
									placeholder="+55 11 99999-9999"
									{...register('phone')}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="whatsapp">WhatsApp (with DDI)</Label>
								<Input
									id="whatsapp"
									placeholder="+55 11 99999-9999"
									{...register('whatsapp')}
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
