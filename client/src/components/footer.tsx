import { ExternalLink, Link } from 'lucide-react'
import { useLocation } from 'wouter'

export function Footer() {
	const [location, setLocation] = useLocation()

	return (
		<footer className='border-t border-primary bg-card py-6 '>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex flex-col items-center space-y-4'>
					{/* Navigation Links */}
					<div className='flex flex-wrap justify-center gap-6 text-sm'>
						<button
							onClick={() => setLocation('/about')}
							className='text-foreground hover:text-primary transition-colors cursor-pointer'
						>
							About
						</button>
						<button
							onClick={() => setLocation('/faq')}
							className='text-foreground hover:text-primary transition-colors cursor-pointer'
						>
							FAQ
						</button>
						<button
							onClick={() => setLocation('/pricing')}
							className='text-foreground hover:text-primary transition-colors cursor-pointer'
						>
							Pricing
						</button>

						<button
							onClick={() => setLocation('/contact')}
							className='text-foreground hover:text-primary transition-colors cursor-pointer'
						>
							Contact
						</button>
					</div>

					{/* Description */}
					<p className='text-foreground text-center text-sm'>
						AI-powered trivia games for trade shows and events.
					</p>

					{/* Built by */}
					<p className='flex justify-center items-center text-sm'>
						Built by{' '}
						<a
							href='https://naknick.com'
							target='_blank'
							rel='noopener noreferrer'
							className='text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors'
						>
							<img
								src='/assets/naknick-logo.png'
								alt='QuizBooth.games logo'
								className='h-6 mx-2'
							/>
							NakNick.com
							<ExternalLink className='h-3 w-3' />
						</a>
					</p>
				</div>
			</div>
		</footer>
	)
}
