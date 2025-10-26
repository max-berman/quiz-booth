import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Play, AlertCircle, CheckCircle } from 'lucide-react'
import { analytics } from '@/lib/analytics'

interface AnalyticsDebugProps {
	className?: string
}

export function AnalyticsDebug({ className }: AnalyticsDebugProps) {
	const [analyticsStatus, setAnalyticsStatus] = useState<{
		isInitialized: boolean
		isGtagAvailable: boolean
		measurementId: string
		queuedEvents: number
		lastEvent: string | null
	}>({
		isInitialized: false,
		isGtagAvailable: false,
		measurementId: '',
		queuedEvents: 0,
		lastEvent: null,
	})

	const [testEvents, setTestEvents] = useState<string[]>([])

	// Function to check analytics status (this would need to access internal state)
	const checkAnalyticsStatus = () => {
		// Since we can't access private properties directly, we'll simulate status
		// In a real implementation, we'd need to expose these via the analytics service
		const status = {
			isInitialized:
				typeof window !== 'undefined' &&
				typeof (window as any).gtag === 'function',
			isGtagAvailable:
				typeof window !== 'undefined' &&
				typeof (window as any).gtag === 'function',
			measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'Not configured',
			queuedEvents: 0, // This would need to be exposed by the analytics service
			lastEvent: testEvents[testEvents.length - 1] || null,
		}
		setAnalyticsStatus(status)
	}

	useEffect(() => {
		checkAnalyticsStatus()
	}, [])

	const testPageView = () => {
		analytics.trackPageView('Test Page View')
		setTestEvents((prev) => [...prev, 'page_view'])
	}

	const testGameStart = () => {
		analytics.trackGameStart({
			gameId: 'test-game-123',
			difficulty: 'easy',
			categories: ['Company Facts'],
			questionCount: 5,
		})
		setTestEvents((prev) => [...prev, 'game_start'])
	}

	const testQuestionAnswered = () => {
		analytics.trackQuestionAnswered({
			gameId: 'test-game-123',
			questionIndex: 1,
			isCorrect: true,
			timeSpent: 15,
			currentStreak: 2,
			totalScore: 250,
		})
		setTestEvents((prev) => [...prev, 'question_answered'])
	}

	const testGameCompleted = () => {
		analytics.trackGameCompleted({
			gameId: 'test-game-123',
			finalScore: 500,
			correctAnswers: 4,
			totalQuestions: 5,
			totalTime: 120,
			maxStreak: 3,
		})
		setTestEvents((prev) => [...prev, 'game_completed'])
	}

	const testError = () => {
		analytics.trackError({
			type: 'other',
			message: 'Test error event',
			context: 'analytics-debug',
		})
		setTestEvents((prev) => [...prev, 'error_occurred'])
	}

	const clearTestEvents = () => {
		setTestEvents([])
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className='flex items-center justify-between'>
					<span>Analytics Debug</span>
					<Button
						variant='outline'
						size='sm'
						onClick={checkAnalyticsStatus}
						className='flex items-center gap-2'
					>
						<RefreshCw className='h-4 w-4' />
						Refresh
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Status Section */}
				<div className='space-y-2'>
					<h3 className='font-semibold'>Status</h3>
					<div className='grid grid-cols-2 gap-2 text-sm'>
						<div className='flex items-center gap-2'>
							<span>Initialized:</span>
							{analyticsStatus.isInitialized ? (
								<Badge variant='default' className='flex items-center gap-1'>
									<CheckCircle className='h-3 w-3' />
									Yes
								</Badge>
							) : (
								<Badge
									variant='destructive'
									className='flex items-center gap-1'
								>
									<AlertCircle className='h-3 w-3' />
									No
								</Badge>
							)}
						</div>
						<div className='flex items-center gap-2'>
							<span>gtag Available:</span>
							{analyticsStatus.isGtagAvailable ? (
								<Badge variant='default' className='flex items-center gap-1'>
									<CheckCircle className='h-3 w-3' />
									Yes
								</Badge>
							) : (
								<Badge
									variant='destructive'
									className='flex items-center gap-1'
								>
									<AlertCircle className='h-3 w-3' />
									No
								</Badge>
							)}
						</div>
						<div className='flex items-center gap-2'>
							<span>Measurement ID:</span>
							<code className='text-xs bg-muted px-2 py-1 rounded'>
								{analyticsStatus.measurementId}
							</code>
						</div>
						<div className='flex items-center gap-2'>
							<span>Queued Events:</span>
							<Badge variant='outline'>{analyticsStatus.queuedEvents}</Badge>
						</div>
					</div>
				</div>

				{/* Test Events Section */}
				<div className='space-y-2'>
					<h3 className='font-semibold'>Test Events</h3>
					<div className='grid grid-cols-2 gap-2'>
						<Button
							size='sm'
							onClick={testPageView}
							className='flex items-center gap-2'
						>
							<Play className='h-3 w-3' />
							Page View
						</Button>
						<Button
							size='sm'
							onClick={testGameStart}
							className='flex items-center gap-2'
						>
							<Play className='h-3 w-3' />
							Game Start
						</Button>
						<Button
							size='sm'
							onClick={testQuestionAnswered}
							className='flex items-center gap-2'
						>
							<Play className='h-3 w-3' />
							Question
						</Button>
						<Button
							size='sm'
							onClick={testGameCompleted}
							className='flex items-center gap-2'
						>
							<Play className='h-3 w-3' />
							Game Complete
						</Button>
						<Button
							size='sm'
							onClick={testError}
							className='flex items-center gap-2'
						>
							<Play className='h-3 w-3' />
							Error
						</Button>
						<Button
							size='sm'
							variant='outline'
							onClick={clearTestEvents}
							disabled={testEvents.length === 0}
						>
							Clear
						</Button>
					</div>
				</div>

				{/* Event History */}
				{testEvents.length > 0 && (
					<div className='space-y-2'>
						<h3 className='font-semibold'>Recent Test Events</h3>
						<div className='space-y-1 max-h-32 overflow-y-auto'>
							{testEvents
								.slice(-10)
								.reverse()
								.map((event, index) => (
									<div
										key={index}
										className='text-xs bg-muted px-2 py-1 rounded flex items-center gap-2'
									>
										<Play className='h-3 w-3 text-muted-foreground' />
										<code>{event}</code>
										<span className='text-muted-foreground ml-auto'>
											{new Date().toLocaleTimeString()}
										</span>
									</div>
								))}
						</div>
					</div>
				)}

				{/* Instructions */}
				<div className='text-xs text-muted-foreground space-y-1'>
					<p>
						<strong>Instructions:</strong>
					</p>
					<p>1. Click test buttons to send events to Google Analytics</p>
					<p>2. Check browser console for analytics debug logs</p>
					<p>3. Verify events appear in Google Analytics dashboard</p>
					<p>4. Use browser network tab to see gtag requests</p>
				</div>
			</CardContent>
		</Card>
	)
}
