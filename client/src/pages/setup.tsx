import { useState, useMemo, useCallback, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Helmet } from 'react-helmet-async'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { analytics } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, Wand2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { GenerationProgress } from '@/components/generation-progress'
import { SetupErrorBoundary } from '@/components/setup-error-boundary'
import {
	CompanyInformationSection,
	GameSettingsSection,
	PrizeSettingsSection,
} from '@/components/setup-form-sections'
import { validateSetupForm } from '@/lib/website-utils'
import type { InsertGame } from '@shared/firebase-types'
import { clearGameResults } from '@/lib/session-utils'

interface FormData {
	companyName: string
	industry: string
	productDescription: string
	questionCount: string
}

interface Prize {
	placement: string
	prize: string
}

interface Categories {
	companyFacts: boolean
	industryKnowledge: boolean
	funFacts: boolean
	generalKnowledge: boolean
	other: boolean
}

function SetupContent() {
	const [, setLocation] = useLocation()
	const { toast } = useToast()
	const { isAuthenticated } = useAuth()
	const queryClient = useQueryClient()
	const [isGenerating, setIsGenerating] = useState(false)
	const [difficulty, setDifficulty] = useState('easy')
	const [categories, setCategories] = useState<Categories>({
		companyFacts: true,
		industryKnowledge: false,
		funFacts: true,
		generalKnowledge: false,
		other: false,
	})
	const [customCategory, setCustomCategory] = useState('')
	const [customIndustry, setCustomIndustry] = useState('')
	const [focusedSection, setFocusedSection] = useState<number | null>(null)
	const [industryOpen, setIndustryOpen] = useState(false)

	const [formData, setFormData] = useState<FormData>({
		companyName: '',
		industry: '',
		productDescription: '',
		questionCount: '5',
	})

	const [prizes, setPrizes] = useState<Prize[]>([{ placement: '', prize: '' }])

	// Validation state
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({})
	const [validationMessages, setValidationMessages] = useState<
		Record<string, string>
	>({})

	// Track field interactions and delayed validation display
	const [fieldInteractions, setFieldInteractions] = useState<
		Record<string, boolean>
	>({})
	const [delayedValidationErrors, setDelayedValidationErrors] = useState<
		Record<string, string>
	>({})
	const [delayedValidationMessages, setDelayedValidationMessages] = useState<
		Record<string, string>
	>({})

	// Memoized form state checks
	const checkCompanyComplete = useCallback((): boolean => {
		const companyNameValid = Boolean(formData.companyName.trim())
		const industryValid = Boolean(formData.industry)

		// If industry is "Other", custom industry must be valid
		const customIndustryValid =
			formData.industry !== 'Other' || Boolean(customIndustry.trim())

		return companyNameValid && industryValid && customIndustryValid
	}, [formData.companyName, formData.industry, customIndustry])

	const checkSettingsComplete = useCallback((): boolean => {
		const selectedCategories = Object.values(categories).some(Boolean)
		const customCategoryValid =
			!categories.other || Boolean(customCategory.trim())
		return Boolean(
			selectedCategories && formData.questionCount && customCategoryValid
		)
	}, [categories, formData.questionCount, customCategory])

	// Initialize Firebase Functions
	const {
		createGame: createGameFunction,
		generateQuestions: generateQuestionsFunction,
		deleteGame: deleteGameFunction,
	} = useFirebaseFunctions()

	// Game creation mutation
	const createGameMutation = useMutation({
		mutationFn: async (gameData: InsertGame) => {
			// Use the correct data format expected by Firebase Functions
			const firebaseGameData = {
				title: gameData.gameTitle || null,
				description:
					formData.industry === 'Other' ? customIndustry : gameData.industry,
				companyName: gameData.companyName,
				productDescription: gameData.productDescription || null,
				questionCount: gameData.questionCount,
				difficulty: gameData.difficulty,
				categories: gameData.categories,
				customCategoryDescription: gameData.customCategoryDescription || null,
				prizes: gameData.prizes || null,
			}

			const result = await createGameFunction(firebaseGameData)
			return result.data as { id: string }
		},
		onSuccess: async (game: { id: string }) => {
			setIsGenerating(true)

			// Track game creation event
			analytics.trackGameCreated({
				gameId: game.id,
				companyName: formData.companyName,
				industry: formData.industry,
				questionCount: parseInt(formData.questionCount),
				difficulty: difficulty,
				categories: Object.entries(categories)
					.filter(([, selected]) => selected)
					.map(([key]) => {
						switch (key) {
							case 'companyFacts':
								return 'Company Facts'
							case 'industryKnowledge':
								return 'Industry Knowledge'
							case 'funFacts':
								return 'Fun Facts'
							case 'generalKnowledge':
								return 'General Knowledge'
							case 'other':
								return customCategory.trim() || 'Custom Questions'
							default:
								return key
						}
					}),
			})

			// Start question generation asynchronously - don't wait for completion
			// The GenerationProgress component will handle monitoring the progress
			try {
				// Start the generation process but don't wait for it to complete
				generateQuestionsFunction({ gameId: game.id }).catch((error) => {
					console.error('Question generation function call failed:', error)
					// Don't delete the game here - let the progress tracker handle errors
					// The function might still be running on the server even if client times out
				})
			} catch (error) {
				console.error('Failed to start question generation:', error)
				// Don't delete the game - let the progress tracker handle it
			}
		},
		onError: (error) => {
			console.error('Game creation error:', error)
			toast({
				title: 'Error',
				description: 'Failed to create game. Please try again.',
				variant: 'destructive',
			})
		},
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!isAuthenticated) {
			toast({
				title: 'Authentication Required',
				description: 'Please sign in to create a trivia game.',
				variant: 'destructive',
			})
			setLocation('/auth/sign-in')
			return
		}

		if (!formData.companyName.trim()) {
			toast({
				title: 'Error',
				description: 'Company name or website is required.',
				variant: 'destructive',
			})
			return
		}

		const selectedCategories = Object.entries(categories)
			.filter(([, selected]) => selected)
			.map(([key]) => {
				switch (key) {
					case 'companyFacts':
						return 'Company Facts'
					case 'industryKnowledge':
						return 'Industry Knowledge'
					case 'funFacts':
						return 'Fun Facts'
					case 'generalKnowledge':
						return 'General Knowledge'
					case 'other':
						return 'Custom Questions' // Always use fixed string for storage
					default:
						return key
				}
			})

		if (selectedCategories.length === 0) {
			toast({
				title: 'Error',
				description: 'Please select at least one question category.',
				variant: 'destructive',
			})
			return
		}

		// Check if custom category is required but empty
		if (categories.other && !customCategory.trim()) {
			toast({
				title: 'Error',
				description:
					'Please describe your custom questions when selecting Custom Questions category.',
				variant: 'destructive',
			})
			return
		}

		// Filter out empty prizes
		const validPrizes = prizes.filter(
			(p) => p.placement.trim() && p.prize.trim()
		)

		const gameData: InsertGame = {
			...formData,
			questionCount: parseInt(formData.questionCount),
			difficulty,
			categories: selectedCategories,
			customCategoryDescription:
				categories.other && customCategory.trim()
					? customCategory.trim()
					: undefined,
			prizes: validPrizes.length > 0 ? validPrizes : null,
		}

		createGameMutation.mutate(gameData)
	}

	// Helper functions for prize management
	const addPrize = () => {
		setPrizes([...prizes, { placement: '', prize: '' }])
	}

	const removePrize = (index: number) => {
		setPrizes(prizes.filter((_, i) => i !== index))
	}

	const updatePrize = (index: number, field: keyof Prize, value: string) => {
		const updatedPrizes = [...prizes]
		updatedPrizes[index][field] = value
		setPrizes(updatedPrizes)
	}

	// Toggle category selection
	const toggleCategory = (key: keyof Categories) => {
		setCategories((prev) => ({
			...prev,
			[key]: !prev[key],
		}))
	}

	// Update form data handler
	const handleFormDataChange = (updates: Partial<FormData>) => {
		setFormData((prev) => ({ ...prev, ...updates }))
	}

	// Update custom industry handler
	const handleCustomIndustryChange = (value: string) => {
		setCustomIndustry(value)
	}

	// Update custom category handler
	const handleCustomCategoryChange = (value: string) => {
		setCustomCategory(value)
	}

	// Difficulty change handler
	const handleDifficultyChange = (level: string) => {
		setDifficulty(level)
	}

	// Category toggle handler
	const handleCategoryToggle = (key: keyof Categories) => {
		toggleCategory(key)
	}

	// Industry open change handler
	const handleIndustryOpenChange = (open: boolean) => {
		setIndustryOpen(open)
	}

	// Focused section change handler
	const handleFocusedSectionChange = (section: number | null) => {
		setFocusedSection(section)
	}

	// Real-time validation functions
	const validateForm = useCallback(() => {
		const validation = validateSetupForm(
			{
				companyName: formData.companyName,
				industry: formData.industry,
				customIndustry: customIndustry,
				productDescription: formData.productDescription,
			},
			fieldInteractions
		)
		setValidationErrors(validation.errors)
		setValidationMessages(validation.messages)
		return validation.isValid
	}, [
		formData.companyName,
		formData.industry,
		customIndustry,
		formData.productDescription,
		fieldInteractions,
	])

	// Track field interactions
	const handleFieldInteraction = useCallback((fieldName: string) => {
		setFieldInteractions((prev) => ({
			...prev,
			[fieldName]: true,
		}))
	}, [])

	// Update form data with interaction tracking
	const updateFormData = useCallback(
		(updates: Partial<FormData>) => {
			setFormData((prev) => {
				const newFormData = { ...prev, ...updates }
				// Track interaction for changed fields
				Object.keys(updates).forEach((field) => {
					handleFieldInteraction(field)
				})
				// If industry changed to "Other", trigger custom industry validation
				if (
					updates.industry === 'Other' ||
					(prev.industry === 'Other' && updates.industry !== 'Other')
				) {
					handleFieldInteraction('customIndustry')
				}

				validateForm()

				return newFormData
			})
		},
		[validateForm, handleFieldInteraction]
	)

	// Update custom industry with interaction tracking
	const updateCustomIndustry = useCallback(
		(value: string) => {
			setCustomIndustry(value)
			handleFieldInteraction('customIndustry')
			validateForm()
		},
		[validateForm, handleFieldInteraction]
	)

	// Delayed validation effect - shows validation messages after 1-2 seconds of interaction
	useEffect(() => {
		const timer = setTimeout(() => {
			setDelayedValidationErrors(validationErrors)
			setDelayedValidationMessages(validationMessages)
		}, 1000) // 1 second delay

		return () => clearTimeout(timer)
	}, [validationErrors, validationMessages])

	// Validate on initial render and when dependencies change
	useEffect(() => {
		validateForm()
	}, [validateForm])

	if (isGenerating) {
		return (
			<div className='flex-1 flex items-center justify-center bg-background py-6'>
				<div className='max-w-4xl mx-auto px-2 lg:px-6'>
					<GenerationProgress
						gameId={createGameMutation.data?.id || ''}
						onComplete={() => {
							// Navigate to game created page when generation is complete
							if (createGameMutation.data?.id) {
								setLocation(`/game-created/${createGameMutation.data.id}`)
							}
						}}
						onError={(error) => {
							console.error('Question generation failed:', error)
							toast({
								title: 'Error',
								description: 'Failed to generate questions. Please try again.',
								variant: 'destructive',
							})
							setIsGenerating(false)
						}}
					/>
				</div>
			</div>
		)
	}

	return (
		<>
			<Helmet>
				<title>Create Trivia Game - QuizBooth</title>
				<meta
					name='description'
					content="Create custom AI-powered trivia games for your business events. Generate engaging questions in minutes with QuizBooth's setup wizard."
				/>
				<meta property='og:title' content='Create Trivia Game - QuizBooth' />
				<meta
					property='og:description'
					content="Create custom AI-powered trivia games for your business events. Generate engaging questions in minutes with QuizBooth's setup wizard."
				/>
				<meta property='og:url' content='https://quizbooth.games/setup' />
				<meta name='twitter:title' content='Create Trivia Game - QuizBooth' />
				<meta
					name='twitter:description'
					content="Create custom AI-powered trivia games for your business events. Generate engaging questions in minutes with QuizBooth's setup wizard."
				/>
				<link rel='canonical' href='https://quizbooth.games/setup' />
			</Helmet>
			<div className='flex-1 bg-background py-6'>
				<div className='max-w-4xl mx-auto px-2 lg:px-6'>
					{/* Header */}
					<div className='text-center my-4 lg:my-8'>
						<h1 className='text-2xl lg:text-4xl md:text-5xl font-bold text-foreground mb-4'>
							Create Your <span className='text-primary'>Trivia Game</span>
						</h1>
						<p className='text-base lg:text-lg text-foreground max-w-2xl mx-auto'>
							Generate engaging AI-powered trivia questions for your trade show
							booth in just a few minutes
						</p>
					</div>

					<Card className='border-none bg-background shadow-none py-2'>
						{!isAuthenticated && (
							<div className='flex items-center justify-center gap-2 text-destructive  p-2 rounded-lg'>
								<AlertCircle className='h-5 w-5' />
								<span className='font-medium'>
									Sign In Required to Generate Trivia
								</span>
							</div>
						)}
						<CardContent className='p-2'>
							<form onSubmit={handleSubmit} className='space-y-8'>
								{/* Company Information Section */}
								<CompanyInformationSection
									formData={formData}
									customIndustry={customIndustry}
									focusedSection={focusedSection}
									industryOpen={industryOpen}
									checkCompanyComplete={checkCompanyComplete}
									onFormDataChange={updateFormData}
									onCustomIndustryChange={updateCustomIndustry}
									onIndustryOpenChange={handleIndustryOpenChange}
									onFocusedSectionChange={handleFocusedSectionChange}
									validationErrors={
										formData.industry === 'Other'
											? validationErrors
											: delayedValidationErrors
									}
									validationMessages={
										formData.industry === 'Other'
											? validationMessages
											: delayedValidationMessages
									}
								/>

								{/* Game Settings Section */}
								<GameSettingsSection
									formData={formData}
									categories={categories}
									difficulty={difficulty}
									customCategory={customCategory}
									focusedSection={focusedSection}
									checkSettingsComplete={checkSettingsComplete}
									onFormDataChange={handleFormDataChange}
									onDifficultyChange={handleDifficultyChange}
									onCategoryToggle={handleCategoryToggle}
									onCustomCategoryChange={handleCustomCategoryChange}
									onFocusedSectionChange={handleFocusedSectionChange}
								/>

								{/* Prize Settings Section */}
								<PrizeSettingsSection
									prizes={prizes}
									focusedSection={focusedSection}
									onAddPrize={addPrize}
									onRemovePrize={removePrize}
									onUpdatePrize={updatePrize}
									onFocusedSectionChange={handleFocusedSectionChange}
								/>

								{/* Submit Section */}
								<section className='p-0'>
									<div className='text-center space-y-2'>
										{isAuthenticated &&
											(!checkCompanyComplete() || !checkSettingsComplete()) && (
												<div className='flex items-center justify-center gap-2 text-destructive'>
													<AlertCircle className='h-4 w-4' />
													<span className='text-sm'>
														Please complete required sections above
													</span>
												</div>
											)}

										<Button
											type='submit'
											size='lg'
											className='px-4 py-4 font-bold text-base lg:text-lg rounded-xl'
											disabled={
												createGameMutation.isPending ||
												!isAuthenticated ||
												!checkCompanyComplete() ||
												!checkSettingsComplete()
											}
										>
											<Wand2 className='mr-3 h-5 w-5' />
											{!isAuthenticated
												? 'Sign In to Generate Trivia'
												: createGameMutation.isPending
												? 'Creating...'
												: 'Generate Trivia Game'}
										</Button>
									</div>
								</section>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	)
}

/**
 * Setup page component wrapped with error boundary for better error handling
 */
export default function Setup() {
	return (
		<SetupErrorBoundary>
			<SetupContent />
		</SetupErrorBoundary>
	)
}
