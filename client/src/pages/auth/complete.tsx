import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLocation } from 'wouter'

export default function CompleteSignIn() {
	const [email, setEmail] = useState('')
	const [isCompleting, setIsCompleting] = useState(false)
	const [completed, setCompleted] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const { completeSignIn } = useAuth()
	const { toast } = useToast()
	const [, setLocation] = useLocation()

	useEffect(() => {
		// Try to get email from localStorage
		const storedEmail = localStorage.getItem('emailForSignIn')
		if (storedEmail) {
			setEmail(storedEmail)
			handleCompleteSignIn(storedEmail)
		}
	}, [])

	const handleCompleteSignIn = async (emailToUse: string) => {
		if (!emailToUse.trim()) {
			setError('Please enter your email address.')
			return
		}

		setIsCompleting(true)
		setError(null)

		try {
			await completeSignIn(emailToUse)
			setCompleted(true)
			toast({
				title: 'Welcome!',
				description: 'You have been signed in successfully.',
			})

			// Redirect to dashboard after a short delay
			setTimeout(() => {
				setLocation('/dashboard')
			}, 2000)
		} catch (error) {
			console.error('Complete sign-in error:', error)
			setError(
				'Failed to complete sign-in. Please try again or request a new link.'
			)
			toast({
				title: 'Sign-in failed',
				description: 'There was an error completing your sign-in.',
				variant: 'destructive',
			})
		} finally {
			setIsCompleting(false)
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		handleCompleteSignIn(email)
	}

	if (completed) {
		return (
			<div className='flex-1 bg-background py-8 items-center flex'>
				<div className='max-w-md mx-auto px-4'>
					<Card>
						<CardHeader>
							<CardTitle className='text-center text-primary'>
								Sign-in Successful!
							</CardTitle>
						</CardHeader>
						<CardContent className='text-center space-y-4'>
							<div className='w-16 h-16 bg-background border-2 border-primary rounded-full flex items-center justify-center mx-auto'>
								<CheckCircle className='h-8 w-8 text-primary' />
							</div>
							<p className='text-gray-600'>
								Welcome! You'll be redirected to your dashboard in a moment.
							</p>
							<Button
								onClick={() => setLocation('/dashboard')}
								className='w-full'
								data-testid='button-go-dashboard'
							>
								Go to Dashboard
								<ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='flex-1 bg-background py-8 items-center flex'>
				<div className='max-w-md mx-auto px-4'>
					<Card>
						<CardHeader>
							<CardTitle className='text-center text-destructive'>
								Sign-in Error
							</CardTitle>
						</CardHeader>
						<CardContent className='text-center space-y-4'>
							<div className='w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto border-2 border-destructive'>
								<AlertCircle className='h-8 w-8 text-destructive' />
							</div>
							<p className='text-gray-600'>{error}</p>
							<div className='space-y-2'>
								<Button
									onClick={() => {
										setError(null)
										setEmail('')
									}}
									className='w-full'
									data-testid='button-try-again'
								>
									Try Again
								</Button>
								<Button
									onClick={() => setLocation('/auth/sign-in')}
									variant='ghost'
									className='w-full'
									data-testid='button-request-new-link'
								>
									Request New Link
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 bg-background py-8 items-center flex'>
			<div className='max-w-md mx-auto px-4'>
				<Card>
					<CardHeader>
						<CardTitle className='text-center'>Complete Sign-in</CardTitle>
						<p className='text-center text-gray-600 text-sm'>
							{email
								? 'Completing sign-in...'
								: 'Enter your email to complete sign-in'}
						</p>
					</CardHeader>
					<CardContent>
						{isCompleting ? (
							<div className='text-center space-y-4'>
								<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto' />
								<p className='text-gray-600'>Signing you in...</p>
							</div>
						) : (
							<form onSubmit={handleSubmit} className='space-y-4'>
								<div>
									<Input
										id='email'
										type='email'
										placeholder='your@email.com'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										data-testid='input-email'
									/>
									<p className='text-xs text-gray-500 mt-1'>
										This should be the same email where you received the sign-in
										link.
									</p>
								</div>

								<Button
									type='submit'
									className='w-full'
									data-testid='button-complete-signin'
								>
									Complete Sign-in
								</Button>
							</form>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
