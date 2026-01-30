'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'

export function ForgotPasswordForm() {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
	})

	const handleFormSubmit = async (data: ForgotPasswordFormData) => {
		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			})

			const result = await response.json()

			if (!response.ok) {
				setError(result.error || 'Failed to process your request. Please try again.')
				return
			}

			setSuccess(true)
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

	if (success) {
		return (
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center text-green-600">
						Check your email
					</CardTitle>
				</CardHeader>
				<CardContent className="text-center space-y-4">
					<p className="text-muted-foreground">
						If an account with that email exists, we&apos;ve sent a password
						reset link.
					</p>
					<Link href="/login">
						<Button variant="outline" className="w-full">
							<ArrowLeft className="mr-2 h-4 w-4" />
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
					Forgot password?
				</CardTitle>
				<CardDescription className="text-center">
					Enter your email and we&apos;ll send you a reset link
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
								{...register('email')}
							/>
						</div>
						{errors.email && (
							<p className="text-sm text-destructive">{errors.email.message}</p>
						)}
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : (
							'Send reset link'
						)}
					</Button>
				</form>

				<div className="text-center">
					<Link
						href="/login"
						className="text-sm text-muted-foreground hover:text-primary inline-flex items-center"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to login
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}
