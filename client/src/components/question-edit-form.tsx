import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Check } from 'lucide-react'
import type { Question } from '@shared/firebase-types'

interface QuestionEditFormProps {
	question: Question
	questionEdits: Partial<Question>
	isPending: boolean
	onUpdateField: (field: keyof Question, value: any) => void
	onUpdateOption: (optionIndex: number, value: string) => void
	onSave: () => void
	onCancel: () => void
}

export function QuestionEditForm({
	question,
	questionEdits,
	isPending,
	onUpdateField,
	onUpdateOption,
	onSave,
	onCancel,
}: QuestionEditFormProps) {
	const currentQuestionText =
		questionEdits.questionText ?? question.questionText
	const currentOptions = questionEdits.options ?? question.options
	const currentCorrectAnswer =
		questionEdits.correctAnswer ?? question.correctAnswer
	const currentExplanation = questionEdits.explanation ?? question.explanation

	return (
		<div className='space-y-6'>
			<div>
				<Label htmlFor={`question-${question.id}`}>Question Text</Label>
				<Textarea
					id={`question-${question.id}`}
					value={currentQuestionText}
					onChange={(e) => onUpdateField('questionText', e.target.value)}
					className='mt-1'
					rows={3}
					data-testid={`input-question-text-${question.id}`}
				/>
			</div>

			<div>
				<Label>Answer Options</Label>
				<div className='space-y-3 mt-2'>
					{currentOptions.map((option, optionIndex) => (
						<div key={optionIndex} className='flex items-center gap-3'>
							<div
								className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
									currentCorrectAnswer === optionIndex
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-muted-foreground border border-primary border-dashed'
								}`}
							>
								{String.fromCharCode(65 + optionIndex)}
							</div>
							<Input
								value={option}
								onChange={(e) => onUpdateOption(optionIndex, e.target.value)}
								className={`flex-1 ${
									currentCorrectAnswer === optionIndex
										? 'border border-primary'
										: ''
								}`}
								data-testid={`input-option-${question.id}-${optionIndex}`}
							/>
							<Button
								variant={
									currentCorrectAnswer === optionIndex ? 'default' : 'outline'
								}
								size='sm'
								onClick={() => onUpdateField('correctAnswer', optionIndex)}
								data-testid={`button-correct-${question.id}-${optionIndex}`}
							>
								{currentCorrectAnswer === optionIndex ? (
									<>
										<Check className='h-6 w-6 mr-2' /> Correct
									</>
								) : (
									<>Mark Correct</>
								)}
							</Button>
						</div>
					))}
				</div>
			</div>

			<div>
				<Label htmlFor={`explanation-${question.id}`}>
					Explanation (Optional)
				</Label>
				<Textarea
					id={`explanation-${question.id}`}
					value={currentExplanation || ''}
					onChange={(e) => onUpdateField('explanation', e.target.value)}
					className='mt-1'
					rows={2}
					placeholder='Explain why this is the correct answer...'
					data-testid={`input-explanation-${question.id}`}
				/>
			</div>

			<div className='flex gap-3 pt-4'>
				<Button
					onClick={onSave}
					disabled={isPending}
					data-testid={`button-save-${question.id}`}
				>
					<Save className='h-4 w-4 mr-2' />
					{isPending ? 'Saving...' : 'Save Changes'}
				</Button>
				<Button
					variant='outline'
					onClick={onCancel}
					disabled={isPending}
					data-testid={`button-cancel-${question.id}`}
				>
					Cancel
				</Button>
			</div>
		</div>
	)
}
