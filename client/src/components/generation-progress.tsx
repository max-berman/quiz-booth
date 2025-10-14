import { useState, useEffect } from 'react'
import { collection, doc, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
	Building,
	Settings,
	Wand2,
	CheckCircle,
	AlertCircle,
	Clock,
	Database,
	RefreshCw,
} from 'lucide-react'

interface GenerationProgress {
	gameId: string
	status:
		| 'starting'
		| 'generating_title'
		| 'generating_questions'
		| 'saving_questions'
		| 'completed'
		| 'error'
	progress: number
	message: string
	timestamp: Timestamp
	error?: string
}

interface GenerationProgressProps {
	gameId: string
	onComplete?: () => void
	onError?: (error: string) => void
}

export function GenerationProgress({
	gameId,
	onComplete,
	onError,
}: GenerationProgressProps) {
	const [progress, setProgress] = useState<GenerationProgress | null>(null)
	const [isListening, setIsListening] = useState(true)
	const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

	// Get status icon based on current status
	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'starting':
				return <Clock className='h-5 w-5 text-blue-500' />
			case 'generating_title':
				return <Building className='h-5 w-5 text-blue-500' />
			case 'generating_questions':
				return <Wand2 className='h-5 w-5 text-purple-500' />
			case 'saving_questions':
				return <Database className='h-5 w-5 text-green-500' />
			case 'completed':
				return <CheckCircle className='h-5 w-5 text-green-500' />
			case 'error':
				return <AlertCircle className='h-5 w-5 text-red-500' />
			default:
				return <Settings className='h-5 w-5 text-gray-500' />
		}
	}

	// Get status badge color
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'starting':
				return 'bg-blue-100 text-blue-800 border-blue-200'
			case 'generating_title':
				return 'bg-blue-100 text-blue-800 border-blue-200'
			case 'generating_questions':
				return 'bg-purple-100 text-purple-800 border-purple-200'
			case 'saving_questions':
				return 'bg-green-100 text-green-800 border-green-200'
			case 'completed':
				return 'bg-green-100 text-green-800 border-green-200'
			case 'error':
				return 'bg-red-100 text-red-800 border-red-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	// Get status label
	const getStatusLabel = (status: string) => {
		switch (status) {
			case 'starting':
				return 'Starting Generation'
			case 'generating_title':
				return 'Generating Title'
			case 'generating_questions':
				return 'Generating Questions'
			case 'saving_questions':
				return 'Saving Questions'
			case 'completed':
				return 'Completed'
			case 'error':
				return 'Error'
			default:
				return status
		}
	}

	// Set initial progress state immediately when component mounts
	useEffect(() => {
		console.log('GenerationProgress mounted with gameId:', gameId)
		if (!progress) {
			console.log('Setting initial progress state')
			setProgress({
				gameId,
				status: 'starting',
				progress: 5,
				message: 'Starting question generation process...',
				timestamp: Timestamp.now(),
			})
		}
	}, [gameId, progress])

	// Real-time Firestore listener for progress updates with retry mechanism
	useEffect(() => {
		if (!gameId || !isListening) return

		let retryCount = 0
		const maxRetries = 3
		let unsubscribe: (() => void) | null = null

		const setupListener = () => {
			console.log(
				`Setting up Firestore listener for generation progress: ${gameId} (attempt ${
					retryCount + 1
				})`
			)

			const progressDocRef = doc(db, 'generationProgress', gameId)

			unsubscribe = onSnapshot(
				progressDocRef,
				(docSnapshot) => {
					if (docSnapshot.exists()) {
						const progressData = docSnapshot.data() as GenerationProgress
						console.log('Progress update received:', progressData)
						setProgress(progressData)
						setLastUpdate(new Date())
						retryCount = 0 // Reset retry count on successful update
					} else {
						console.log(
							'Progress document does not exist yet - waiting for updates'
						)
						// Don't set progress here - let the initial state remain
					}
				},
				(error) => {
					console.error('Firestore listener error:', error)

					if (retryCount < maxRetries) {
						retryCount++
						console.log(
							`Retrying Firestore listener in ${retryCount * 2000}ms...`
						)
						setTimeout(() => {
							if (isListening) {
								setupListener()
							}
						}, retryCount * 2000)
					} else {
						console.error('Max retries reached for Firestore listener')
						setProgress({
							gameId,
							status: 'error',
							progress: 0,
							message: 'Failed to connect to progress tracking',
							timestamp: Timestamp.now(),
							error: error.message,
						})
					}
				}
			)
		}

		setupListener()

		return () => {
			console.log('Cleaning up Firestore listener')
			if (unsubscribe) {
				unsubscribe()
			}
		}
	}, [gameId, isListening])

	// Handle completion and errors
	useEffect(() => {
		if (progress?.status === 'completed') {
			console.log('Generation completed successfully')
			setIsListening(false)
			onComplete?.()
		} else if (progress?.status === 'error') {
			console.log('Generation failed with error:', progress.error)
			setIsListening(false)
			onError?.(progress.error || 'Unknown error occurred')
		}
	}, [progress, onComplete, onError])

	if (!progress) {
		return (
			<Card className='w-full max-w-2xl mx-auto'>
				<CardContent className='p-6'>
					<div className='flex items-center space-x-4'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
						<div>
							<h3 className='font-semibold'>Initializing...</h3>
							<p className='text-sm text-muted-foreground'>
								Setting up question generation
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className='w-full max-w-2xl mx-auto'>
			<CardContent className='p-6 space-y-4'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-3'>
						{getStatusIcon(progress.status)}
						<div>
							<h3 className='font-semibold text-lg'>
								Generating Trivia Questions
							</h3>
							<p className='text-sm text-muted-foreground'>
								{progress.message}
							</p>
						</div>
					</div>
					<Badge variant='outline' className={getStatusColor(progress.status)}>
						{getStatusLabel(progress.status)}
					</Badge>
				</div>

				{/* Progress Bar */}
				<div className='space-y-2'>
					<div className='flex justify-between text-sm'>
						<span>Progress</span>
						<span className='font-medium'>{progress.progress}%</span>
					</div>
					<Progress value={progress.progress} className='h-2' />
				</div>

				{/* Status Details */}
				<div className='grid grid-cols-2 gap-4 text-sm'>
					<div>
						<span className='text-muted-foreground'>Game ID:</span>
						<p className='font-mono text-xs truncate'>{progress.gameId}</p>
					</div>
					<div>
						<span className='text-muted-foreground'>Last Update:</span>
						<p>{progress.timestamp.toDate().toLocaleTimeString()}</p>
					</div>
				</div>

				{/* Error Display */}
				{progress.status === 'error' && progress.error && (
					<div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
						<div className='flex items-center space-x-2 text-red-800'>
							<AlertCircle className='h-4 w-4' />
							<span className='font-medium'>Error:</span>
						</div>
						<p className='text-sm text-red-700 mt-1'>{progress.error}</p>
					</div>
				)}

				{/* Progress Steps */}
				<div className='space-y-2'>
					<div
						className={`flex items-center space-x-3 p-2 rounded-lg ${
							progress.status === 'starting'
								? 'bg-blue-50 border border-blue-200'
								: ''
						}`}
					>
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center ${
								[
									'generating_title',
									'generating_questions',
									'saving_questions',
									'completed',
								].includes(progress.status)
									? 'bg-green-500 text-white'
									: progress.status === 'starting'
									? 'bg-blue-500 text-white'
									: 'bg-gray-200 text-gray-500'
							}`}
						>
							{[
								'generating_title',
								'generating_questions',
								'saving_questions',
								'completed',
							].includes(progress.status) ? (
								<CheckCircle className='h-3 w-3' />
							) : (
								<span className='text-xs'>1</span>
							)}
						</div>
						<span className='text-sm'>Initial Setup</span>
					</div>

					<div
						className={`flex items-center space-x-3 p-2 rounded-lg ${
							progress.status === 'generating_title'
								? 'bg-blue-50 border border-blue-200'
								: ''
						}`}
					>
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center ${
								[
									'generating_questions',
									'saving_questions',
									'completed',
								].includes(progress.status)
									? 'bg-green-500 text-white'
									: progress.status === 'generating_title'
									? 'bg-blue-500 text-white'
									: 'bg-gray-200 text-gray-500'
							}`}
						>
							{[
								'generating_questions',
								'saving_questions',
								'completed',
							].includes(progress.status) ? (
								<CheckCircle className='h-3 w-3' />
							) : (
								<span className='text-xs'>2</span>
							)}
						</div>
						<span className='text-sm'>Generating Game Title</span>
					</div>

					<div
						className={`flex items-center space-x-3 p-2 rounded-lg ${
							progress.status === 'generating_questions'
								? 'bg-purple-50 border border-purple-200'
								: ''
						}`}
					>
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center ${
								['saving_questions', 'completed'].includes(progress.status)
									? 'bg-green-500 text-white'
									: progress.status === 'generating_questions'
									? 'bg-purple-500 text-white'
									: 'bg-gray-200 text-gray-500'
							}`}
						>
							{['saving_questions', 'completed'].includes(progress.status) ? (
								<CheckCircle className='h-3 w-3' />
							) : (
								<span className='text-xs'>3</span>
							)}
						</div>
						<span className='text-sm'>Generating Questions</span>
					</div>

					<div
						className={`flex items-center space-x-3 p-2 rounded-lg ${
							progress.status === 'saving_questions'
								? 'bg-green-50 border border-green-200'
								: ''
						}`}
					>
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center ${
								progress.status === 'completed'
									? 'bg-green-500 text-white'
									: progress.status === 'saving_questions'
									? 'bg-green-500 text-white'
									: 'bg-gray-200 text-gray-500'
							}`}
						>
							{progress.status === 'completed' ? (
								<CheckCircle className='h-3 w-3' />
							) : (
								<span className='text-xs'>4</span>
							)}
						</div>
						<span className='text-sm'>Saving Questions</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
