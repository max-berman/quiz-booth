import type { Question } from '@shared/firebase-types'
import { Check } from 'lucide-react'

interface QuestionDisplayProps {
	question: Question
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
	return (
		<div className='space-y-4'>
			<div>
				<p
					className='text-lg font-medium text-foreground'
					data-testid={`text-question-${question.id}`}
				>
					{question.questionText}
				</p>
			</div>

			<div className='space-y-2'>
				{question.options.map((option, optionIndex) => (
					<div
						key={optionIndex}
						className={`flex items-center gap-3 p-3 rounded-md border ${
							question.correctAnswer === optionIndex
								? 'bg-primary/80 border-primary text-primary-foreground font-bold'
								: 'bg-primary-foreground border-primary border border-dashed'
						}`}
						data-testid={`option-${question.id}-${optionIndex}`}
					>
						<div
							className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
								question.correctAnswer === optionIndex
									? 'bg-primary text-primary-foreground border border-primary-foreground'
									: 'bg-muted border border-primary text-muted-foreground'
							}`}
						>
							{String.fromCharCode(65 + optionIndex)}
						</div>
						<span className='flex-1'>{option}</span>
						{question.correctAnswer === optionIndex && (
							<span className='text-sm font-medium text-primary-foreground'>
								<Check className='h-6 w-6 mr-2' />
							</span>
						)}
					</div>
				))}
			</div>

			{question.explanation && (
				<div className='bg-background p-4 rounded-md'>
					<p className='text-sm text-foreground'>
						<strong>Explanation:</strong> {question.explanation}
					</p>
				</div>
			)}
		</div>
	)
}
