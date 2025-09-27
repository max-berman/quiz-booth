import { useState, useEffect } from 'react'
import { useLocation, useParams } from 'wouter'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QuestionDisplay } from '@/components/question-display'
import { QuestionEditForm } from '@/components/question-edit-form'
import { useToast } from '@/hooks/use-toast'
import {
	ArrowLeft,
	Save,
	Edit3,
	AlertCircle,
	Plus,
	X,
	Trash2,
} from 'lucide-react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/auth-context'
import { generateSingleQuestion, type TriviaQuestion } from '@/lib/deepseek'
import type { Question, Game } from '@shared/firebase-types'
import { useFirebaseFunctions } from '@/hooks/use-firebase-functions'

const TOTAL_QUESTIONS = 15

export default function EditQuestions() {
	const [location, setLocation] = useLocation()
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { id: gameId } = useParams()
	const { user, loading } = useAuth()

	// Get gameId from URL
	const currentGameId = gameId
	const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
	const [questionEdits, setQuestionEdits] = useState<
		Record<string, Partial<Question>>
	>({})
	const [isAddingQuestion, setIsAddingQuestion] = useState(false)
	const [newQuestion, setNewQuestion] = useState({
		questionText: '',
		options: ['', '', '', ''],
		correctAnswer: 0,
		explanation: '',
	})

	// Initialize Firebase Functions
	const { getGame, getQuestions, updateQuestion, addQuestion, deleteQuestion } =
		useFirebaseFunctions()

	const { data: game } = useQuery<Game>({
		queryKey: [`game-${currentGameId}`],
		queryFn: async () => {
			const result = await getGame({ gameId: currentGameId })
			return result.data as Game
		},
		enabled: !!currentGameId,
	})

	const { data: questions, isLoading } = useQuery<Question[]>({
		queryKey: [`questions-${currentGameId}`],
		queryFn: async () => {
			const result = await getQuestions({ gameId: currentGameId })
			return result.data as Question[]
		},
		enabled: !!currentGameId,
	})

	const updateQuestionMutation = useMutation({
		mutationFn: async ({
			questionId,
			updates,
		}: {
			questionId: string
			updates: Partial<Question>
		}) => {
			if (!user) {
				throw new Error('Authentication required to edit questions')
			}

			const result = await updateQuestion({ questionId, updates })
			return result.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [`questions-${currentGameId}`],
			})
			toast({
				title: 'Question updated',
				description: 'Your changes have been saved successfully.',
			})
			setEditingQuestion(null)
			setQuestionEdits({})
		},
		onError: (error: any) => {
			console.error('Update question error:', error)
			toast({
				title: 'Failed to update question',
				description: error.message || 'Please try again.',
				variant: 'destructive',
			})
		},
	})

	const addQuestionMutation = useMutation({
		mutationFn: async (questionData: {
			questionText: string
			options: string[]
			correctAnswer: number
			explanation: string
		}) => {
			if (!user || !currentGameId) {
				throw new Error('Authentication required to add questions')
			}

			const result = await addQuestion({
				gameId: currentGameId,
				questionData: {
					questionText: questionData.questionText,
					options: questionData.options,
					correctAnswer: questionData.correctAnswer,
					explanation: questionData.explanation,
				},
			})
			return result.data
		},
		onMutate: async (newQuestionData) => {
			// Cancel any outgoing refetches to avoid overwriting our optimistic update
			await queryClient.cancelQueries({
				queryKey: [`questions-${currentGameId}`],
			})

			// Snapshot the previous value
			const previousQuestions = queryClient.getQueryData<Question[]>([
				`questions-${currentGameId}`,
			])

			// Generate a temporary ID for the optimistic update
			const tempId = `temp-${Date.now()}`

			// Optimistically add the question to the UI
			if (previousQuestions) {
				const optimisticQuestion: Question = {
					id: tempId,
					gameId: currentGameId!,
					questionText: newQuestionData.questionText,
					options: newQuestionData.options,
					correctAnswer: newQuestionData.correctAnswer,
					explanation: newQuestionData.explanation || null,
					order: (previousQuestions.length || 0) + 1,
				}

				queryClient.setQueryData<Question[]>(
					[`questions-${currentGameId}`],
					[...previousQuestions, optimisticQuestion]
				)
			}

			return { previousQuestions, tempId }
		},
		onSuccess: (data, variables, context) => {
			// Invalidate all relevant queries to ensure UI stays in sync with actual data
			queryClient.invalidateQueries({
				queryKey: [`questions-${currentGameId}`],
			})
			queryClient.invalidateQueries({
				queryKey: [`game-${currentGameId}`],
			})
			toast({
				title: 'Question added',
				description: 'Your new question has been added successfully.',
			})
			setIsAddingQuestion(false)
			setNewQuestion({
				questionText: '',
				options: ['', '', '', ''],
				correctAnswer: 0,
				explanation: '',
			})
		},
		onError: (error: any, variables, context: any) => {
			console.error('Add question error:', error)

			// Roll back the optimistic update on error
			if (context?.previousQuestions) {
				queryClient.setQueryData<Question[]>(
					[`questions-${currentGameId}`],
					context.previousQuestions
				)
			}

			toast({
				title: 'Failed to add question',
				description: error.message || 'Please try again.',
				variant: 'destructive',
			})
		},
	})

	const deleteQuestionMutation = useMutation({
		mutationFn: async (questionId: string) => {
			if (!user) {
				throw new Error('Authentication required to delete questions')
			}

			const result = await deleteQuestion({ questionId })
			return result.data
		},
		onMutate: async (questionId: string) => {
			// Cancel any outgoing refetches to avoid overwriting our optimistic update
			await queryClient.cancelQueries({
				queryKey: [`questions-${currentGameId}`],
			})

			// Snapshot the previous value
			const previousQuestions = queryClient.getQueryData<Question[]>([
				`questions-${currentGameId}`,
			])

			// Optimistically remove the question from the UI
			if (previousQuestions) {
				queryClient.setQueryData<Question[]>(
					[`questions-${currentGameId}`],
					previousQuestions.filter((q) => q.id !== questionId)
				)
			}

			return { previousQuestions }
		},
		onSuccess: () => {
			// Invalidate all relevant queries to ensure UI stays in sync
			queryClient.invalidateQueries({
				queryKey: [`questions-${currentGameId}`],
			})
			queryClient.invalidateQueries({
				queryKey: [`game-${currentGameId}`],
			})
			toast({
				title: 'Question deleted',
				description: 'The question has been deleted successfully.',
			})
		},
		onError: (error: any, questionId: string, context: any) => {
			console.error('Delete question error:', error)

			// Roll back the optimistic update on error
			if (context?.previousQuestions) {
				queryClient.setQueryData<Question[]>(
					[`questions-${currentGameId}`],
					context.previousQuestions
				)
			}

			toast({
				title: 'Failed to delete question',
				description: error.message || 'Please try again.',
				variant: 'destructive',
			})
		},
	})

	const generateQuestionMutation = useMutation({
		mutationFn: async () => {
			if (!user || !currentGameId) {
				throw new Error('Authentication required to generate questions')
			}

			const generatedQuestion = await generateSingleQuestion(
				currentGameId,
				questions || []
			)
			return generatedQuestion
		},
		onSuccess: (generatedQuestion: TriviaQuestion) => {
			// Populate the new question form with the generated question
			setNewQuestion({
				questionText: generatedQuestion.questionText,
				options: generatedQuestion.options,
				correctAnswer: generatedQuestion.correctAnswer,
				explanation: generatedQuestion.explanation || '',
			})
			toast({
				title: 'Question generated',
				description: 'AI has generated a new question for you to review.',
			})
		},
		onError: (error: any) => {
			console.error('Generate question error:', error)
			toast({
				title: 'Failed to generate question',
				description: error.message || 'Please try again.',
				variant: 'destructive',
			})
		},
	})

	const handleEdit = (questionId: string) => {
		const question = questions?.find((q) => q.id === questionId)
		if (question) {
			setQuestionEdits({
				[questionId]: {
					questionText: question.questionText,
					options: [...question.options],
					correctAnswer: question.correctAnswer,
					explanation: question.explanation || '',
				},
			})
			setEditingQuestion(questionId)
		}
	}

	const handleSave = (questionId: string) => {
		const updates = questionEdits[questionId]
		if (updates) {
			updateQuestionMutation.mutate({ questionId, updates })
		}
	}

	const handleCancel = () => {
		setEditingQuestion(null)
		setQuestionEdits({})
	}

	const updateQuestionField = (
		questionId: string,
		field: keyof Question,
		value: any
	) => {
		setQuestionEdits((prev) => ({
			...prev,
			[questionId]: {
				...prev[questionId],
				[field]: value,
			},
		}))
	}

	const updateOption = (
		questionId: string,
		optionIndex: number,
		value: string
	) => {
		setQuestionEdits((prev) => {
			const currentOptions = prev[questionId]?.options || []
			const newOptions = [...currentOptions]
			newOptions[optionIndex] = value
			return {
				...prev,
				[questionId]: {
					...prev[questionId],
					options: newOptions,
				},
			}
		})
	}

	const updateNewQuestionOption = (optionIndex: number, value: string) => {
		setNewQuestion((prev) => {
			const newOptions = [...prev.options]
			newOptions[optionIndex] = value
			return {
				...prev,
				options: newOptions,
			}
		})
	}

	const handleAddQuestion = () => {
		// Validate the new question
		if (!newQuestion.questionText.trim()) {
			toast({
				title: 'Validation Error',
				description: 'Question text is required.',
				variant: 'destructive',
			})
			return
		}

		if (newQuestion.options.some((option) => !option.trim())) {
			toast({
				title: 'Validation Error',
				description: 'All answer options must be filled.',
				variant: 'destructive',
			})
			return
		}

		addQuestionMutation.mutate(newQuestion)
	}

	const handleCancelAdd = () => {
		setIsAddingQuestion(false)
		setNewQuestion({
			questionText: '',
			options: ['', '', '', ''],
			correctAnswer: 0,
			explanation: '',
		})
	}

	if (loading) {
		return (
			<div className='flex-1 bg-background flex items-center justify-center my-6'>
				<div className='text-center'>
					<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
					<p>Loading...</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='flex-1 bg-background py-8'>
				<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
					<Card>
						<CardContent className='p-8 text-center'>
							<AlertCircle className='h-16 w-16 text-destructive mx-auto mb-4' />
							<h2 className='text-2xl font-bold mb-4'>Sign In Required</h2>
							<p className='text-muted-foreground mb-6'>
								You must be signed in to edit questions. Only the game creator
								can make changes.
							</p>
							<div className='space-x-4'>
								<Button onClick={() => setLocation('/auth/sign-in')}>
									Sign In
								</Button>
								<Button variant='outline' onClick={() => setLocation('/')}>
									Return to Home
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		)
	}

	if (isLoading) {
		return (
			<div className='flex-1 bg-background flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
					<p>Loading questions...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex-1 bg-background py-8'>
			<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<div className='flex items-center gap-4 mb-8'>
					<div>
						<h1 className='text-h1 text-foreground'>Edit Questions</h1>
						<p className='text-foreground'>
							<strong>{game?.companyName}</strong> -{' '}
							<strong>{questions?.length || 0}</strong> questions
						</p>
					</div>
				</div>

				{/* Add Question Button */}
				<div className='mb-6'>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className='inline-block'>
									<Button
										onClick={() => setIsAddingQuestion(true)}
										disabled={
											isAddingQuestion ||
											editingQuestion !== null ||
											(questions && questions.length >= TOTAL_QUESTIONS)
										}
										data-testid='button-add-question'
									>
										<Plus className='h-4 w-4 mr-2' />
										Add New Question
									</Button>
								</div>
							</TooltipTrigger>
							<TooltipContent
								className='bg-destructive text-destructive-foreground'
								side='right'
								hidden={!(questions && questions.length >= TOTAL_QUESTIONS)}
							>
								<p className=' '>
									You can only create {TOTAL_QUESTIONS} questions per game
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>

				{/* Add New Question Form */}
				{isAddingQuestion && (
					<Card className='mb-6 border-primary'>
						<CardHeader className='pb-4'>
							<div className='flex items-center justify-between'>
								<CardTitle className='text-lg'>Add New Question</CardTitle>
								<Button
									variant='outline'
									className='px-2'
									size='sm'
									onClick={handleCancelAdd}
									data-testid='button-cancel-add'
								>
									<X className='h-6 w-6' />
								</Button>
							</div>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div>
								<Label htmlFor='new-question-text'>Question Text</Label>
								<Textarea
									id='new-question-text'
									value={newQuestion.questionText}
									onChange={(e) =>
										setNewQuestion((prev) => ({
											...prev,
											questionText: e.target.value,
										}))
									}
									className='mt-1'
									rows={3}
									placeholder='Enter your trivia question...'
									data-testid='input-new-question-text'
								/>
							</div>

							<div className='flex justify-end'>
								{' '}
								<Button
									onClick={() => generateQuestionMutation.mutate()}
									size='sm'
									disabled={
										generateQuestionMutation.isPending ||
										addQuestionMutation.isPending
									}
									variant='secondary'
									data-testid='button-generate-question'
								>
									{generateQuestionMutation.isPending
										? 'Generating...'
										: 'Generate Question with AI'}
								</Button>
							</div>

							<div>
								<Label>Answer Options</Label>
								<div className='space-y-3 mt-2'>
									{newQuestion.options.map((option, optionIndex) => (
										<div key={optionIndex} className='flex items-center gap-3'>
											<div
												className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
													newQuestion.correctAnswer === optionIndex
														? 'bg-primary text-primary-foreground'
														: 'bg-muted text-muted-foreground border border-primary border-dashed'
												}`}
											>
												{String.fromCharCode(65 + optionIndex)}
											</div>
											<Input
												value={option}
												onChange={(e) =>
													updateNewQuestionOption(optionIndex, e.target.value)
												}
												className={`flex-1 ${
													newQuestion.correctAnswer === optionIndex
														? 'border border-primary'
														: ''
												}`}
												placeholder={`Option ${String.fromCharCode(
													65 + optionIndex
												)}`}
												data-testid={`input-new-option-${optionIndex}`}
											/>
											<Button
												variant={
													newQuestion.correctAnswer === optionIndex
														? 'default'
														: 'outline'
												}
												size='sm'
												onClick={() =>
													setNewQuestion((prev) => ({
														...prev,
														correctAnswer: optionIndex,
													}))
												}
												data-testid={`button-new-correct-${optionIndex}`}
											>
												{newQuestion.correctAnswer === optionIndex
													? 'Correct'
													: 'Mark Correct'}
											</Button>
										</div>
									))}
								</div>
							</div>

							<div>
								<Label htmlFor='new-explanation'>Explanation (Optional)</Label>
								<Textarea
									id='new-explanation'
									value={newQuestion.explanation}
									onChange={(e) =>
										setNewQuestion((prev) => ({
											...prev,
											explanation: e.target.value,
										}))
									}
									className='mt-1'
									rows={2}
									placeholder='Explain why this is the correct answer...'
									data-testid='input-new-explanation'
								/>
							</div>

							<div className='flex gap-3 pt-4'>
								<Button
									onClick={handleAddQuestion}
									disabled={addQuestionMutation.isPending}
									data-testid='button-save-new-question'
								>
									<Save className='h-4 w-4 mr-2' />
									{addQuestionMutation.isPending ? 'Adding...' : 'Save'}
								</Button>

								<Button
									variant='outline'
									onClick={handleCancelAdd}
									disabled={addQuestionMutation.isPending}
									data-testid='button-cancel-new-question'
								>
									Cancel
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Questions List */}
				<div className='space-y-6'>
					{questions?.map((question, index) => (
						<Card key={question.id} className='relative'>
							<CardHeader className='pb-4'>
								<div className='flex items-center justify-between'>
									<CardTitle className='text-lg'>
										Question {index + 1}
									</CardTitle>
									{editingQuestion !== question.id && (
										<div className='flex gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => handleEdit(question.id)}
												data-testid={`button-edit-${question.id}`}
											>
												<Edit3 className='h-4 w-4 mr-2' />
												Edit
											</Button>
											<Button
												variant='destructive'
												size='sm'
												onClick={() =>
													deleteQuestionMutation.mutate(question.id)
												}
												disabled={deleteQuestionMutation.isPending}
												data-testid={`button-delete-${question.id}`}
											>
												<Trash2 className='h-4 w-4 mr-2' />
												{deleteQuestionMutation.isPending
													? 'Deleting...'
													: 'Delete'}
											</Button>
										</div>
									)}
								</div>
							</CardHeader>
							<CardContent className='space-y-4'>
								{editingQuestion === question.id ? (
									// Edit mode
									<QuestionEditForm
										question={question}
										questionEdits={questionEdits[question.id] || {}}
										isPending={updateQuestionMutation.isPending}
										onUpdateField={(field, value) =>
											updateQuestionField(question.id, field, value)
										}
										onUpdateOption={(optionIndex, value) =>
											updateOption(question.id, optionIndex, value)
										}
										onSave={() => handleSave(question.id)}
										onCancel={handleCancel}
									/>
								) : (
									// View mode
									<QuestionDisplay question={question} />
								)}
							</CardContent>
						</Card>
					))}
				</div>

				{questions?.length === 0 && (
					<Card>
						<CardContent className='p-8 text-center'>
							<p className='text-muted-foreground'>
								No questions found for this game.
							</p>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
