import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
	CheckCircle,
	XCircle,
	Timer,
	ArrowRight,
	Lightbulb,
} from 'lucide-react'
import { useEffect } from 'react'

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
	const sampleQuestion = {
		questionText: 'What is the capital of France?',
		options: ['Paris', 'London', 'Berlin', 'Madrid'],
		correctAnswer: 0,
		explanation:
			'Paris has been the capital of France since the 12th century and is known for its rich history, art, and culture.',
	}

	// Apply customization styles using CSS variables
	useEffect(() => {
		const root = document.documentElement

		if (primaryColor) {
			const hsl = hexToHSL(primaryColor)
			root.style.setProperty('--primary-h', hsl.h.toString())
			root.style.setProperty('--primary-s', `${hsl.s}%`)
			root.style.setProperty('--primary-l', `${hsl.l}%`)
		}

		if (secondaryColor) {
			const hsl = hexToHSL(secondaryColor)
			root.style.setProperty('--secondary-h', hsl.h.toString())
			root.style.setProperty('--secondary-s', `${hsl.s}%`)
			root.style.setProperty('--secondary-l', `${hsl.l}%`)
		}

		if (tertiaryColor) {
			const hsl = hexToHSL(tertiaryColor)
			root.style.setProperty('--background-h', hsl.h.toString())
			root.style.setProperty('--background-s', `${hsl.s}%`)
			root.style.setProperty('--background-l', `${hsl.l}%`)
		}

		if (quaternaryColor) {
			const hsl = hexToHSL(quaternaryColor)
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

	// Helper function to convert hex to HSL
	function hexToHSL(hex: string) {
		// Remove the hash if it exists
		hex = hex.replace(/^#/, '')

		// Parse the hex values
		let r, g, b
		if (hex.length === 3) {
			r = parseInt(hex[0] + hex[0], 16)
			g = parseInt(hex[1] + hex[1], 16)
			b = parseInt(hex[2] + hex[2], 16)
		} else if (hex.length === 6) {
			r = parseInt(hex.slice(0, 2), 16)
			g = parseInt(hex.slice(2, 4), 16)
			b = parseInt(hex.slice(4, 6), 16)
		} else {
			throw new Error('Invalid hex color')
		}

		// Convert to 0-1 range
		r /= 255
		g /= 255
		b /= 255

		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		let h = 0,
			s = 0,
			l = (max + min) / 2

		if (max !== min) {
			const d = max - min
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0)
					break
				case g:
					h = (b - r) / d + 2
					break
				case b:
					h = (r - g) / d + 4
					break
			}

			h /= 6
		}

		return {
			h: Math.round(h * 360),
			s: Math.round(s * 100),
			l: Math.round(l * 100),
		}
	}

	const previewStyles = {
		'--primary-color': primaryColor,
		'--secondary-color': secondaryColor,
		'--tertiary-color': tertiaryColor,
		'--quaternary-color': quaternaryColor,
	} as React.CSSProperties

	return (
		<div className='flex-1 bg-background ' style={previewStyles}>
			{/* Top Navigation Bar */}
			<div className='top-0 z-50 bg-background/80 backdrop-blur-sm shadow-md '>
				<div className='max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 '>
					<ul className='flex items-center justify-between h-20'>
						<li className='w-1/4 flex justify-start'>
							<a
								href='/'
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center gap-2 text-xl text-foreground hover:text-secondary-foreground'
							>
								<img
									src='/assets/logo_.svg'
									alt='QuizBooth.games logo'
									className='h-8 w-auto'
								/>
								<span className='hidden lg:block hover:scale-[1.02] transition-all font-medium'>
									QuizBooth
								</span>
							</a>
						</li>

						<li className='w-2/4 flex justify-center'>
							<a href='/' target='_blank' rel='noopener noreferrer'>
								{customLogoUrl ? (
									<img
										src={customLogoUrl}
										alt='Custom game logo'
										className='max-h-16 w-auto'
									/>
								) : (
									<img
										src='/assets/naknick-logo.png'
										alt='QuizBooth.games logo'
										className='max-h-16 w-auto'
									/>
								)}
							</a>
						</li>

						<li className='w-1/4 flex justify-end'>
							<Button
								size='sm'
								className='flex items-center gap-2 !text-white'
								style={{ backgroundColor: primaryColor }}
							>
								Next <ArrowRight className='h-4 w-4' />
							</Button>
						</li>
					</ul>
				</div>
			</div>

			<div className='max-w-4xl mx-auto px-0 lg:px-6 py-4 space-y-4 text-primary'>
				{/* Timer and Stats - Compact version */}
				<div className='flex justify-between items-center w-full'>
					<div className='text-center p-2 h-full min-w-[60px]'>
						<Timer
							className={`h-6 w-6 -rotate-[30deg] mx-auto mb-1`}
							style={{ color: primaryColor }}
						/>
						<div className='text-lg font-bold' style={{ color: primaryColor }}>
							25s
						</div>
					</div>

					{/* Game Progress */}
					<div className='space-y-4 w-full mx-4'>
						<div
							className='text-lg text-center font-medium'
							style={{ color: primaryColor }}
						>
							Question <strong>1</strong> of 10
						</div>
						<Progress value={10} className='h-4 bg-card' />
					</div>
					<div className='text-center p-2 h-full'>
						<div
							className='text-primary capitalize'
							style={{ color: primaryColor }}
						>
							Score <strong className='text-lg'>0</strong>
						</div>
					</div>
				</div>

				{/* Question Card */}
				<Card className='game-card !my-8 bg-card animate-slide-up rounded-none md:rounded-2xl shadow-md border-0 md:border-1'>
					<CardContent className='p-0 pb-4 md:p-6'>
						{/* Question Text */}
						<div className=''>
							<div
								className='bg-gradient-to-r from-primary/10 to-secondary/10 rounded-none md:rounded-2xl p-4 mb-4'
								style={{
									background: `linear-gradient(to right, ${primaryColor}10, ${secondaryColor}10)`,
								}}
							>
								<h2
									className='text-lg md:text-2xl font-bold text-primary leading-relaxed text-center'
									style={{ color: primaryColor }}
								>
									{sampleQuestion.questionText}
								</h2>
							</div>

							{/* Answer Options */}
							<div className='space-y-4 px-4 md:px-0'>
								{sampleQuestion.options.map((option, index) => {
									// Helper function to determine button styling based on answer state
									const getButtonClasses = () => {
										// Preview shows interactive state (not answered)
										return 'border-primary hover:border-primary bg-background border-dashed hover:scale-[1.02]'
									}

									// Helper function to determine letter badge styling
									const getLetterBadgeClasses = () => {
										// Preview shows default state
										return 'bg-primary/20 text-primary'
									}

									return (
										<button
											key={index}
											type='button'
											className={`w-full p-4 md:p-5 rounded-xl border-2 text-left transition-all duration-200 ${getButtonClasses()}`}
											style={{
												borderColor: primaryColor,
												backgroundColor: 'var(--background)',
											}}
										>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-4'>
													<span
														className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getLetterBadgeClasses()}`}
														style={{
															backgroundColor: `${primaryColor}20`,
															color: primaryColor,
														}}
													>
														{String.fromCharCode(65 + index)}
													</span>
													<span
														className='text-base md:text-lg font-medium'
														style={{ color: primaryColor }}
													>
														{option}
													</span>
												</div>
											</div>
										</button>
									)
								})}
							</div>

							{/* Explanation */}
							<div className='mt-6 mx-4 md:mx-0 p-6 bg-background/70 rounded-2xl shadow-md animate-slide-up'>
								<div className='flex items-center gap-3 mb-4'>
									<div
										className='w-10 h-10 rounded-full flex items-center justify-center'
										style={{ backgroundColor: primaryColor }}
									>
										<Lightbulb className='h-6 w-6 text-primary-foreground' />
									</div>
									<h3
										className='font-bold text-lg'
										style={{ color: primaryColor }}
									>
										Explanation
									</h3>
								</div>
								<p className='text-foreground leading-relaxed text-base'>
									{sampleQuestion.explanation}
								</p>
							</div>
						</div>

						{/* Bottom Action - Show after answering */}
						<div className='text-center pt-4'>
							<p className='text-sm text-foreground mb-3'>
								Ready for the next question?
							</p>
							<Button
								type='button'
								size='lg'
								className='px-8 py-4 text-xl font-semibold uppercase'
								style={{ backgroundColor: primaryColor }}
							>
								Continue →
							</Button>
						</div>
					</CardContent>
				</Card>
				<div className='flex items-center justify-center mb-2'>
					<a
						href='https://www.naknick.com'
						target='_blank'
						rel='noopener noreferrer'
					>
						<img
							src='/assets/logo.png'
							alt='NaknNick games logo'
							className='h-32 w-auto'
						/>
					</a>
				</div>
			</div>
		</div>
	)
}
