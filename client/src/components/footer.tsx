import { ExternalLink } from 'lucide-react'

export function Footer() {
	return (
		<footer className='border-t border-primary bg-card py-6 mt-8'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-center'>
					<p className='text-lg flex text-foreground items-center'>
						AI-powered trivia games for trade shows and events - Built by{' '}
						<a
							href='https://naknick.com'
							target='_blank'
							rel='noopener noreferrer'
							className='text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors'
						>
							<img
								// src='/src/assets/images/owl.svg'
								src='/src/assets/images/naknick-logo.png'
								alt='QuizBooth.games logo'
								className='h-8 mx-2'
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
