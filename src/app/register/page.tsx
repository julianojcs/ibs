import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
	title: 'Create Account',
	description: 'Create your IBS London account',
}

export default async function RegisterPage() {
	const session = await auth()

	if (session?.user) {
		redirect('/dashboard')
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
			<RegisterForm />
		</div>
	)
}
