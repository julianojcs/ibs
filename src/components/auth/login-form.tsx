'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
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
import { loginSchema, type LoginFormData } from '@/lib/validations'

export function LoginForm() {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	})

	const handleFormSubmit = async (data: LoginFormData) => {
		setIsLoading(true)
		setError(null)

		try {
			const result = await signIn('credentials', {
				email: data.email,
				password: data.password,
				redirect: false,
			})

			if (result?.error) {
				// Parse NextAuth error messages to user-friendly ones
				const errorMap: Record<string, string> = {
					'CredentialsSignin': 'Invalid email or password. Please check your credentials.',
					'Invalid email or password': 'Invalid email or password. Please check your credentials.',
					'Please verify your email before signing in': 'Please verify your email before signing in. Check your inbox.',
					'Your account has been deactivated': 'Your account has been deactivated. Please contact support.',
					'Please sign in with Google': 'This account uses Google Sign-In. Please click "Sign in with Google" below.',
				}
				setError(errorMap[result.error] || result.error)
				return
			}

			router.push('/dashboard')
			router.refresh()
		} catch (err) {
			if (err instanceof TypeError && err.message.includes('fetch')) {
				setError('Unable to connect to the server. Please check your internet connection.')
			} else {
				setError('An unexpected error occurred. Please try again later.')
			}
		} finally {
			setIsLoading(false)
		}
	}

	const handleGoogleSignIn = async () => {
		setIsGoogleLoading(true)
		setError(null)

		try {
			await signIn('google', { callbackUrl: '/dashboard' })
		} catch (err) {
			if (err instanceof TypeError && err.message.includes('fetch')) {
				setError('Unable to connect to the server. Please check your internet connection.')
			} else {
				setError('Failed to initiate Google Sign-In. Please try again.')
			}
			setIsGoogleLoading(false)
		}
	}

	const handleTogglePassword = () => {
		setShowPassword((prev) => !prev)
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-bold text-center">
					Welcome back
				</CardTitle>
				<CardDescription className="text-center">
					Sign in to your IBS London account
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<div
						className="bg-destructive/10 text-destructive text-sm p-3 rounded-md"
						role="alert"
					>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
								aria-describedby={errors.email ? 'email-error' : undefined}
								{...register('email')}
							/>
						</div>
						{errors.email && (
							<p id="email-error" className="text-sm text-destructive">
								{errors.email.message}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Link
								href="/forgot-password"
								className="text-sm text-primary hover:underline"
								tabIndex={0}
							>
								Forgot password?
							</Link>
						</div>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								className="pl-10 pr-10"
								disabled={isLoading}
								aria-describedby={errors.password ? 'password-error' : undefined}
								{...register('password')}
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
								onClick={handleTogglePassword}
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
							<p id="password-error" className="text-sm text-destructive">
								{errors.password.message}
							</p>
						)}
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing in...
							</>
						) : (
							'Sign in'
						)}
					</Button>
				</form>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or continue with
						</span>
					</div>
				</div>

				<Button
					variant="outline"
					className="w-full"
					onClick={handleGoogleSignIn}
					disabled={isGoogleLoading}
				>
					{isGoogleLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
					)}
					Sign in with Google
				</Button>
			</CardContent>
			<CardFooter className="flex justify-center">
				<p className="text-sm text-muted-foreground">
					Don&apos;t have an account?{' '}
					<Link href="/register" className="text-primary hover:underline">
						Sign up
					</Link>
				</p>
			</CardFooter>
		</Card>
	)
}
