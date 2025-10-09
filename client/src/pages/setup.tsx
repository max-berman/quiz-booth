import { useState, useMemo, useCallback } from 'react'
import { useLocation } from 'wouter'
import { Helmet } from 'react-helmet-async'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'
import { analytics } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Building,
	Settings,
	Gift,
	Wand2,
	Plus,
	X,
	CheckCircle,
	AlertCircle,
	Info,
	ChevronsUpDown,
	Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/loading-spinner'
import type { InsertGame } from '@shared/firebase-types'
import { INDUSTRY_OPTIONS } from '@shared/constants'

// Difficulty options
const DIFFICULTY_OPTIONS = [
	{ level: 'easy', label: 'Easy', desc: 'Basic questions' },
	{ level: 'medium', label: 'Medium', desc: 'Moderate difficulty' },
	{ level: 'hard', label: 'Hard', desc: 'Challenging questions' },
]

// Category options
const CATEGORY_OPTIONS = [
	{
		key: 'companyFacts',
		label: 'Company Facts',
		desc: 'Questions about your company',
	},
	{
		key: 'industryKnowledge',
		label: 'Industry Knowledge',
		desc: 'Questions about your industry',
	},
	{ key: 'funFacts', label: 'Fun Facts', desc: 'Entertaining trivia' },
	{ key: 'generalKnowledge', label: 'General Knowledge', desc: 'Broad topics' },
	{ key: 'other', label: 'Custom Questions', desc: 'Your specific topics' },
]

// Question count options
const QUESTION_COUNT_OPTIONS = [
	{ value: '5', label: '5 Questions (Quick)' },
	{ value: '10', label: '10 Questions (Standard)' },
	{ value: '15', label: '15 Questions (Extended)' },
]

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

export default function Setup() {
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

	// Memoized form state checks
	const checkCompanyComplete = useCallback(() => {
		return formData.companyName.trim() && formData.industry
	}, [formData.companyName, formData.industry])

	const checkSettingsComplete = useCallback(() => {
		const selectedCategories = Object.values(categories).some(Boolean)
		const customCategoryValid = !categories.other || customCategory.trim()
		return selectedCategories && formData.questionCount && customCategoryValid
	}, [categories, formData.questionCount, customCategory])

	// Memoized steps calculation
	const steps = useMemo(() => {
		const companyComplete = checkCompanyComplete()
		const settingsComplete = checkSettingsComplete()

		return [
			{
				id: 1,
				title: 'Company Info',
				icon: Building,
				complete: companyComplete,
			},
			{
				id: 2,
				title: 'Game Settings',
				icon: Settings,
				complete: settingsComplete,
			},
			{ id: 3, title: 'Prizes (Optional)', icon: Gift, complete: true },
		]
	}, [checkCompanyComplete, checkSettingsComplete])

	// Initialize Firebase Functions
	const {
		createGame: createGameFunction,
		generateQuestions: generateQuestionsFunction,
	} = useFirebaseFunctions()

	// Game creation mutation
	const createGameMutation = useMutation({
		mutationFn: async (gameData: InsertGame) => {
			// Use the correct data format expected by Firebase Functions
			const firebaseGameData = {
				title: gameData.gameTitle || null,
				description: gameData.industry,
				companyName: gameData.companyName,
				productDescription: gameData.productDescription || null,
				questionCount: gameData.questionCount,
				difficulty:
					gameData.difficulty.charAt(0).toUpperCase() +
					gameData.difficulty.slice(1), // Capitalize first letter
				categories: gameData.categories,
				customCategoryDescription: gameData.customCategoryDescription || null,
				prizes: gameData.prizes || null,
			}

			const result = await createGameFunction(firebaseGameData)
			return result.data as { id: string }
		},
		onSuccess: async (game: { id: string }) => {
			setIsGenerating(true)
			try {
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

				// Generate questions using Firebase Function
				await generateQuestionsFunction({ gameId: game.id })

				// Invalidate dashboard queries to refresh the games list
				queryClient.invalidateQueries({ queryKey: ['getGamesByUser'] })

				setLocation(`/game-created/${game.id}`)
			} catch (error) {
				console.error('Question generation failed:', error)
				// Track AI generation error
				analytics.trackError({
					type: 'ai_generation',
					message: 'Failed to generate questions',
					context: `Game ID: ${game.id}`,
				})
				toast({
					title: 'Error',
					description: 'Failed to generate questions. Please try again.',
					variant: 'destructive',
				})
				setIsGenerating(false)
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

	if (isGenerating) {
		return (
			<div className='flex-1 flex bg-background py-6 items-center'>
				<LoadingSpinner
					message='Generating Your Trivia Questions'
					showTriviaContent={true}
				/>
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
								<section
									className={`p-4 lg:p-6 bg-popover rounded-xl border-2 transition-all border-accent ${
										focusedSection === 1 ? 'shadow-md ' : ''
									}`}
									onFocus={() => setFocusedSection(1)}
									onBlur={() => setFocusedSection(null)}
									tabIndex={0}
								>
									<div className='mb-6'>
										<h3 className='text-base md:text-xl font-bold text-foreground flex items-center'>
											<Building className='text-foreground mr-3 h-6 w-6' />
											Business Information
											{checkCompanyComplete() && (
												<CheckCircle className='ml-2 h-5 w-5 text-primary' />
											)}
										</h3>
									</div>

									<div className='grid md:grid-cols-2 gap-6'>
										<div>
											<Label
												htmlFor='companyName'
												className='text-base font-medium'
											>
												Company Name or Website *
											</Label>
											<Input
												id='companyName'
												placeholder='Enter company name or website URL'
												value={formData.companyName}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														companyName: e.target.value,
													}))
												}
												className={`mt-2 h-12  ${
													formData.companyName.trim()
														? 'border-primary'
														: 'border-border'
												}`}
												required
											/>
											<div className='flex items-start gap-2 mt-2'>
												<Info className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
												<p className='text-sm text-muted-foreground'>
													Provide a website URL for more relevant AI-generated
													questions, or enter your company name.
												</p>
											</div>
										</div>

										<div>
											<Label
												htmlFor='industry'
												className='text-base font-medium'
											>
												Industry *
											</Label>
											<Popover
												open={industryOpen}
												onOpenChange={setIndustryOpen}
											>
												<PopoverTrigger asChild>
													<Button
														variant='outline'
														role='combobox'
														aria-expanded={industryOpen}
														className={`mt-2 h-12 w-full justify-between text-base ${
															formData.industry
																? 'border-primary'
																: 'border-border text-placeholder'
														}`}
													>
														{formData.industry
															? formData.industry
															: 'Select your industry...'}
														<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
													</Button>
												</PopoverTrigger>
												<PopoverContent className='w-full p-0'>
													<Command>
														<CommandInput
															placeholder='Search industry...'
															className='h-9'
														/>
														<CommandList>
															<CommandEmpty>No industry found.</CommandEmpty>
															<CommandGroup>
																{INDUSTRY_OPTIONS.map((industry) => (
																	<CommandItem
																		key={industry}
																		value={industry}
																		onSelect={(currentValue) => {
																			setFormData((prev) => ({
																				...prev,
																				industry:
																					currentValue === formData.industry
																						? ''
																						: currentValue,
																			}))
																			setIndustryOpen(false)
																		}}
																	>
																		{industry}
																		<Check
																			className={cn(
																				'ml-auto',
																				formData.industry === industry
																					? 'opacity-100'
																					: 'opacity-0'
																			)}
																		/>
																	</CommandItem>
																))}
															</CommandGroup>
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</div>

										{formData.industry === 'Other' && (
											<div>
												<Label
													htmlFor='customIndustry'
													className='text-base font-medium'
												>
													Custom Industry *
												</Label>
												<Input
													id='customIndustry'
													placeholder='Enter your industry'
													value={customIndustry}
													onChange={(e) => setCustomIndustry(e.target.value)}
													className={`mt-2 h-12 text-base ${
														customIndustry.trim()
															? 'border-primary'
															: 'border-border'
													}`}
													required
												/>
											</div>
										)}

										<div className='md:col-span-2'>
											<Label
												htmlFor='productDescription'
												className='text-base font-medium'
											>
												Product/Service Focus (Optional)
											</Label>
											<Textarea
												id='productDescription'
												placeholder='Describe your main products or services to get more targeted questions ...'
												value={formData.productDescription}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														productDescription: e.target.value,
													}))
												}
												className={`mt-2  ${
													formData.productDescription.trim()
														? 'border-primary'
														: 'border-border'
												}`}
												rows={3}
											/>
										</div>

										{/* TODO: Provide the key messages that represent your brand. */}
									</div>
								</section>

								{/* Game Settings Section */}
								<section
									className={`p-4 lg:p-6 bg-popover rounded-xl  border-2 transition-all border-accent ${
										focusedSection === 2 ? 'shadow-md ' : ''
									}`}
									onFocus={() => setFocusedSection(2)}
									onBlur={() => setFocusedSection(null)}
									tabIndex={0}
								>
									<div className='mb-6'>
										<h3 className='text-base md:text-xl  font-bold text-foreground flex items-center'>
											<Settings className='text-foreground mr-3 h-6 w-6' />
											Game Settings
											{checkSettingsComplete() && (
												<CheckCircle className='ml-2 h-5 w-5 text-primary' />
											)}
										</h3>
									</div>

									<div className='grid md:grid-cols-2 gap-4'>
										<div>
											<Label
												htmlFor='questionCount'
												className='text-base font-medium'
											>
												Number of Questions
											</Label>
											<Select
												value={formData.questionCount}
												onValueChange={(value) =>
													setFormData((prev) => ({
														...prev,
														questionCount: value,
													}))
												}
											>
												<SelectTrigger
													className={`mt-2 h-12 text-base ${
														formData.questionCount
															? 'border-primary'
															: 'border-border'
													}`}
												>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{QUESTION_COUNT_OPTIONS.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										<div>
											<Label className='text-base font-medium'>
												Difficulty Level
											</Label>
											<div className='grid grid-cols-3 gap-3 mt-3'>
												{DIFFICULTY_OPTIONS.map(({ level, label }) => (
													<Button
														key={level}
														type='button'
														variant={difficulty === level ? 'outline' : 'link'}
														className='h-8 flex flex-col hover:scale-100'
														onClick={() => setDifficulty(level)}
													>
														<span
															className={` ${
																difficulty === level
																	? 'font-bold'
																	: 'font-medium'
															}`}
														>
															{label}
														</span>
													</Button>
												))}
											</div>
										</div>

										<div className='md:col-span-2'>
											<Label className='text-base font-medium'>
												Question Categories *
											</Label>
											<div className='grid grid-cols-1 sm:grid-cols-2 gap-4  mt-3'>
												{CATEGORY_OPTIONS.map(({ key, label, desc }) => (
													<div
														key={key}
														className={`p-2 border rounded-lg transition-all ${
															categories[key as keyof typeof categories]
																? 'border-primary bg-background'
																: 'border-primary border-dashed hover:border-solid'
														}`}
													>
														<div className='flex items-start space-x-2'>
															<Checkbox
																id={key}
																className='mt-1'
																checked={
																	categories[key as keyof typeof categories]
																}
																onCheckedChange={() =>
																	toggleCategory(key as keyof Categories)
																}
															/>
															<label
																htmlFor={key}
																className='cursor-pointer flex-1'
															>
																<span className='font-bold'>{label}</span>
																<p className='text-sm text-muted-foreground'>
																	{desc}
																</p>
															</label>
														</div>
													</div>
												))}
											</div>
											{categories.other && (
												<div className='mt-4 rounded-lg'>
													<Label
														htmlFor='customCategory'
														className='text-base font-medium'
													>
														Describe your custom questions *
													</Label>
													<Textarea
														id='customCategory'
														placeholder='e.g., questions about sustainable packaging, our company history, or specific product features'
														value={customCategory}
														onChange={(e) => setCustomCategory(e.target.value)}
														className={`mt-2 ${
															customCategory.trim()
																? 'border-primary'
																: categories.other && !customCategory.trim()
																? 'border-destructive'
																: 'border-border'
														}`}
														rows={2}
													/>
													{categories.other && !customCategory.trim() && (
														<div className='flex items-center gap-2 mt-2 text-destructive'>
															<AlertCircle className='h-4 w-4' />
															<span className='text-sm'>
																Custom questions description is required when
																selecting Custom Questions category
															</span>
														</div>
													)}
												</div>
											)}
											{!Object.values(categories).some(Boolean) && (
												<div className='flex items-center gap-2 mt-2 text-destructive'>
													<AlertCircle className='h-4 w-4' />
													<span className='text-sm'>
														Please select at least one category
													</span>
												</div>
											)}
										</div>
									</div>
								</section>

								{/* Prize Settings Section */}
								<section
									className={`p-4 lg:p-6 bg-popover rounded-xl border-2 transition-all border-accent ${
										focusedSection === 3 ? 'shadow-md ' : ''
									}`}
									onFocus={() => setFocusedSection(3)}
									onBlur={() => setFocusedSection(null)}
									tabIndex={0}
								>
									<div className='flex flex-col md:flex-row justify-between mb-6'>
										<h3 className='text-base mb-2 md:mb-0 md:text-xl font-bold text-foreground flex items-center'>
											<Gift className='text-foreground mr-2 h-6 w-6' />
											Prize Information (Optional)
											{/* <CheckCircle className='ml-2 h-5 w-5 text-primary' /> */}
										</h3>
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={addPrize}
											className='flex items-center gap-1 w-1/3 md:w-auto  self-end'
										>
											<Plus className='h-2 w-2' />
											Add Prize
										</Button>
									</div>

									<div className='space-y-4'>
										{prizes.map((prize, index) => (
											<div
												key={index}
												className='flex gap-3 items-end p-4  rounded-lg border'
											>
												<div className='flex-1'>
													<Label
														htmlFor={`placement-${index}`}
														className='text-base font-medium'
													>
														Placement
													</Label>
													<Input
														id={`placement-${index}`}
														placeholder='e.g., 1st Place, Top 10, etc.'
														value={prize.placement}
														onChange={(e) =>
															updatePrize(index, 'placement', e.target.value)
														}
														className={`mt-2 h-10 ${
															prize.placement.trim()
																? 'border-primary'
																: 'border-border'
														}`}
													/>
												</div>
												<div className='flex-1'>
													<Label
														htmlFor={`prize-${index}`}
														className='text-base font-medium'
													>
														Prize
													</Label>
													<Input
														id={`prize-${index}`}
														placeholder='e.g., $100 Gift Card'
														value={prize.prize}
														onChange={(e) =>
															updatePrize(index, 'prize', e.target.value)
														}
														className={`mt-2 h-10 ${
															prize.prize.trim()
																? 'border-primary'
																: 'border-border'
														}`}
													/>
												</div>
												{prizes.length > 1 && (
													<Button
														type='button'
														variant='outline'
														size='sm'
														onClick={() => removePrize(index)}
														className='h-10 w-10 p-0'
													>
														<X className='h-2 w-2' />
													</Button>
												)}
											</div>
										))}
										<div className='flex items-start gap-2 p-4 bg-muted rounded-lg'>
											<Info className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
											<p className='text-sm text-primary'>
												Add prizes to motivate participation. You can customize
												placements (e.g., "4th Place", "Top 10", "Best Score")
												to match your event needs.
											</p>
										</div>
									</div>
								</section>

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

										{/* {isAuthenticated && (
										<div className='flex items-center justify-center gap-2 text-primary'>
											<CheckCircle className='h-5 w-5' />
											<span className='font-medium'>
												Our AI will generate your trivia!
											</span>
										</div>
									)} */}

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
