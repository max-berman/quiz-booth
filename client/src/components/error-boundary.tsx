import React from 'react'
import { Button } from '@/components/ui/button'
import { XCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
	errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
	children: React.ReactNode
	fallback?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo }>
}

/**
 * Error Boundary component to catch React errors and prevent blank screens
 */
class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		}
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// Update state so the next render will show the fallback UI
		return {
			hasError: true,
			error,
			errorInfo: null,
		}
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log the error to console
		console.error('React Error Boundary caught an error:', error, errorInfo)

		// Update state with error info
		this.setState({
			error,
			errorInfo,
		})

		// Send error to analytics if available
		if (typeof window !== 'undefined') {
			try {
				// Use the new Firebase Analytics service
				if ((window as any).firebaseAnalytics) {
					;(window as any).firebaseAnalytics.trackError({
						type: 'react_error',
						message: error.message,
						context: errorInfo.componentStack,
					})
				}
			} catch (analyticsError) {
				console.warn('Failed to send error to analytics:', analyticsError)
			}
		}
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		})
	}

	handleReload = () => {
		window.location.reload()
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			if (this.props.fallback) {
				const FallbackComponent = this.props.fallback
				return (
					<FallbackComponent
						error={this.state.error!}
						errorInfo={this.state.errorInfo!}
					/>
				)
			}

			return (
				<div className='min-h-screen bg-background flex items-center justify-center p-4'>
					<div className='max-w-md w-full text-center'>
						<div className='bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6'>
							<XCircle className='h-16 w-16 text-destructive mx-auto mb-4' />
							<h2 className='text-xl font-bold text-destructive mb-2'>
								Something went wrong
							</h2>
							<p className='text-foreground mb-4'>
								We encountered an unexpected error. This might be a temporary
								issue.
							</p>

							{this.state.error && (
								<details className='text-left bg-background/50 rounded p-3 mt-4 text-sm'>
									<summary className='cursor-pointer font-medium mb-2'>
										Error Details
									</summary>
									<div className='font-mono text-xs overflow-auto max-h-32'>
										<div className='mb-2'>
											<strong>Error:</strong> {this.state.error.message}
										</div>
										{this.state.errorInfo && (
											<div>
												<strong>Component Stack:</strong>
												<pre className='mt-1 whitespace-pre-wrap'>
													{this.state.errorInfo.componentStack}
												</pre>
											</div>
										)}
									</div>
								</details>
							)}
						</div>

						<div className='flex gap-3 justify-center'>
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
				</div>
			)
		}

		return this.props.children
	}
}

export default ErrorBoundary
