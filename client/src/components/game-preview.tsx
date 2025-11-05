import { useEffect } from 'react'
import { GamePlayCard } from '@/components/game-play-card'
import { GameBrandingBar } from '@/components/game-branding-bar'
import { GameStatsBar } from '@/components/game-stats-bar'
import { colorToHSL } from '@/lib/color-utils'
import type { Game, Question } from '@shared/firebase-types'

interface GamePreviewProps {
	primaryColor: string
	secondaryColor: string
	tertiaryColor: string
	quaternaryColor: string
	customLogoUrl?: string
}

export function GamePreview({
	primaryColor,
	secondaryColor,
	tertiaryColor,
	quaternaryColor,
	customLogoUrl,
}: GamePreviewProps) {
	// Sample data for preview
	const sampleQuestion: Question = {
		id: 'preview-question',
		gameId: 'preview',
		questionText: 'What is the capital of France?',
		options: ['Paris', 'London', 'Berlin', 'Madrid'],
		correctAnswer: 0,
		explanation:
			'Paris has been the capital of France since the 12th century and is known for its rich history, art, and culture.',
		order: 0,
	}

	// Mock game data for preview
	const mockGame: Game = {
		id: 'preview',
		gameTitle: 'Sample Game',
		companyName: 'Sample Company',
		industry: 'Technology',
		productDescription: 'A sample product for preview',
		questionCount: 10,
		difficulty: 'medium',
		categories: ['General Knowledge'],
		firstPrize: null,
		secondPrize: null,
		thirdPrize: null,
		prizes: null,
		creatorKey: 'preview-key',
		userId: 'preview-user',
		createdAt: new Date(),
		isPublic: true,
		customization: {
			primaryColor,
			secondaryColor,
			tertiaryColor,
			quaternaryColor,
			customLogoUrl: customLogoUrl || '',
			customLogoLink: '',
			isCustomized: true,
		},
	}

	// Apply customization styles using CSS variables
	useEffect(() => {
		const root = document.documentElement

		if (primaryColor) {
			const hsl = colorToHSL(primaryColor)
			root.style.setProperty('--primary-h', hsl.h.toString())
			root.style.setProperty('--primary-s', `${hsl.s}%`)
			root.style.setProperty('--primary-l', `${hsl.l}%`)
		}

		if (secondaryColor) {
			const hsl = colorToHSL(secondaryColor)
			root.style.setProperty('--secondary-h', hsl.h.toString())
			root.style.setProperty('--secondary-s', `${hsl.s}%`)
			root.style.setProperty('--secondary-l', `${hsl.l}%`)
		}

		if (tertiaryColor) {
			const hsl = colorToHSL(tertiaryColor)
			root.style.setProperty('--background-h', hsl.h.toString())
			root.style.setProperty('--background-s', `${hsl.s}%`)
			root.style.setProperty('--background-l', `${hsl.l}%`)
		}

		if (quaternaryColor) {
			const hsl = colorToHSL(quaternaryColor)
			root.style.setProperty('--card-h', hsl.h.toString())
			root.style.setProperty('--card-s', `${hsl.s}%`)
			root.style.setProperty('--card-l', `${hsl.l}%`)
		}

		// Cleanup function to reset styles
		return () => {
			root.style.removeProperty('--primary-h')
			root.style.removeProperty('--primary-s')
			root.style.removeProperty('--primary-l')
			root.style.removeProperty('--secondary-h')
			root.style.removeProperty('--secondary-s')
			root.style.removeProperty('--secondary-l')
			root.style.removeProperty('--background-h')
			root.style.removeProperty('--background-s')
			root.style.removeProperty('--background-l')
			root.style.removeProperty('--card-h')
			root.style.removeProperty('--card-s')
			root.style.removeProperty('--card-l')
		}
	}, [primaryColor, secondaryColor, tertiaryColor, quaternaryColor])

	const previewStyles = {
		'--primary-color': primaryColor,
		'--secondary-color': secondaryColor,
		'--tertiary-color': tertiaryColor,
		'--quaternary-color': quaternaryColor,
	} as React.CSSProperties

	// Preview state
	const currentQuestionIndex = 0
	const questionsLength = 10
	const timeLeft = 25
	const score = 0
	const progressPercentage = 20
	const isAnswered = true
	const showExplanation = true
	const selectedAnswer = 1

	// Mock handlers for preview
	const handleAnswerSelect = () => {
		// No-op for preview
	}

	const handleNextQuestion = () => {
		// No-op for preview
	}

	return (
		<div className='flex-1 flex flex-col bg-background' style={previewStyles}>
			{/* Top Navigation Bar */}
			<div className='sticky flex justify-center top-0 z-50 bg-background/80 backdrop-blur-sm shadow-md'>
				{/* Timer and Stats - Compact version */}
				<GameStatsBar
					timeLeft={timeLeft}
					currentQuestionIndex={currentQuestionIndex}
					questionsLength={questionsLength}
					progressPercentage={progressPercentage}
					score={score}
				/>
			</div>

			<GameBrandingBar
				game={mockGame}
				isAnswered={isAnswered}
				currentQuestionIndex={currentQuestionIndex}
				questionsLength={questionsLength}
				onNextQuestion={handleNextQuestion}
			/>

			<div className='max-w-4xl w-full mx-auto px-0 text-primary'>
				{/* Question Card */}
				<GamePlayCard
					currentQuestion={sampleQuestion}
					currentQuestionIndex={currentQuestionIndex}
					questions={[sampleQuestion]}
					questionsLength={questionsLength}
					selectedAnswer={selectedAnswer}
					isAnswered={isAnswered}
					showExplanation={showExplanation}
					onAnswerSelect={handleAnswerSelect}
					onNextQuestion={handleNextQuestion}
				/>
			</div>
		</div>
	)
}
