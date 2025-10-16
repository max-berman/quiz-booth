import { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error?: Error
}

/**
 * Error Boundary component specifically for the Setup page
 * Catches and handles errors in the setup form component tree
 */
export class SetupErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	}

	public static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error }
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Setup Error Boundary caught an error:', error, errorInfo)

		// You could log to an error reporting service here
		// logErrorToService(error, errorInfo)
	}

	private handleReset = () => {
		this.setState({ hasError: false, error: undefined })
	}

	private handleReload = () => {
		window.location.reload()
	}

	public render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className='flex-1 flex items-center justify-center bg-background py-6'>
					<div className='max-w-2xl mx-auto px-4'>
						<Card className='border-destructive'>
							<CardContent className='p-6 text-center'>
								<div className='flex flex-col items-center space-y-4'>
									<AlertCircle className='h-16 w-16 text-destructive' />

									<div className='space-y-2'>
										<h2 className='text-2xl font-bold text-foreground'>
											Oops! Something went wrong
										</h2>
										<p className='text-muted-foreground'>
											We encountered an unexpected error while setting up your
											trivia game.
										</p>
										{this.state.error && (
											<details className='text-sm text-muted-foreground mt-2'>
												<summary className='cursor-pointer'>
													Technical details
												</summary>
												<code className='block mt-2 p-2 bg-muted rounded text-left'>
													{this.state.error.message}
												</code>
											</details>
										)}
									</div>

									<div className='flex gap-4 mt-4'>
										<Button
											onClick={this.handleReset}
											variant='outline'
											className='flex items-center gap-2'
										>
											<RefreshCw className='h-4 w-4' />
											Try Again
										</Button>
										<Button
											onClick={this.handleReload}
											className='flex items-center gap-2'
										>
											Reload Page
										</Button>
									</div>

									<p className='text-sm text-muted-foreground mt-4'>
										If the problem persists, please contact support.
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}
