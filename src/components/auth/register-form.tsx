'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Lock, Eye, EyeOff, User, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { registerSchema, type RegisterFormData } from '@/lib/validations'

export function RegisterForm() {
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	})

	const handleFormSubmit = async (data: RegisterFormData) => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			const result = await response.json()

			if (!response.ok) {
				// Use the detailed error message from the API
				setError(result.error || 'Registration failed. Please check your information and try again.')
				return
			}

			setSuccess(true)
		} catch (err) {
			// Network or unexpected errors
			if (err instanceof TypeError && err.message.includes('fetch')) {
				setError('Unable to connect to the server. Please check your internet connection.')
			} else {
				setError('An unexpected error occurred. Please try again later.')
			}
		} finally {
			setIsLoading(false)
		}
	}

	if (success) {
		return (
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center text-green-600">
						Check your email!
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-4">
					<p className="text-muted-foreground">
						We&apos;ve sent a verification link to your email address. Please
						click the link to verify your account.
					</p>
					<Link href="/login">
						<Button variant="outline" className="w-full">
							Back to login
						</Button>
					</Link>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-bold text-center">
					Create an account
				</CardTitle>
				<CardDescription className="text-center">
					Join the IBS London community
				</CardDescription>
			</CardHeader>
			<CardContent>
				{error && (
					<div
						className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4"
						role="alert"
					>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Full Name</Label>
						<div className="relative">
							<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="name"
								placeholder="John Doe"
								className="pl-10"
								disabled={isLoading}
								{...register('name')}
							/>
						</div>
						{errors.name && (
							<p className="text-sm text-destructive">{errors.name.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								className="pl-10"
								disabled={isLoading}
								{...register('email')}
							/>
						</div>
						{errors.email && (
							<p className="text-sm text-destructive">{errors.email.message}</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="••••••••"
									className="pl-10 pr-10"
									disabled={isLoading}
									{...register('password')}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
									onClick={() => setShowPassword(!showPassword)}
									tabIndex={0}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4 text-muted-foreground" />
									) : (
										<Eye className="h-4 w-4 text-muted-foreground" />
									)}
								</Button>
							</div>
							{errors.password && (
								<p className="text-sm text-destructive">
									{errors.password.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm</Label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="••••••••"
									className="pl-10 pr-10"
									disabled={isLoading}
									{...register('confirmPassword')}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									tabIndex={0}
									aria-label={
										showConfirmPassword ? 'Hide password' : 'Show password'
									}
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4 text-muted-foreground" />
									) : (
										<Eye className="h-4 w-4 text-muted-foreground" />
									)}
								</Button>
							</div>
							{errors.confirmPassword && (
								<p className="text-sm text-destructive">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="courseNumber">Course Number</Label>
						<Input
							id="courseNumber"
							placeholder="e.g., IBS-2025-1"
							disabled={isLoading}
							{...register('courseNumber')}
						/>
						{errors.courseNumber && (
							<p className="text-sm text-destructive">
								{errors.courseNumber.message}
							</p>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="city">City</Label>
							<div className="relative">
								<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="city"
									placeholder="São Paulo"
									className="pl-10"
									disabled={isLoading}
									{...register('city')}
								/>
							</div>
							{errors.city && (
								<p className="text-sm text-destructive">{errors.city.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="country">Country</Label>
							<Input
								id="country"
								placeholder="Brazil"
								disabled={isLoading}
								{...register('country')}
							/>
							{errors.country && (
								<p className="text-sm text-destructive">
									{errors.country.message}
								</p>
							)}
						</div>
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Creating account...
							</>
						) : (
							'Create account'
						)}
					</Button>
				</form>
			</CardContent>
			<CardFooter className="flex justify-center">
				<p className="text-sm text-muted-foreground">
					Already have an account?{' '}
					<Link href="/login" className="text-primary hover:underline">
						Sign in
					</Link>
				</p>
			</CardFooter>
		</Card>
	)
}
