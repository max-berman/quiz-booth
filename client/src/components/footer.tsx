import { ExternalLink } from 'lucide-react'

export function Footer() {
	return (
		<footer className='border-t border-primary bg-card py-6 mt-8'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex flex-col items-center'>
					<p className=' flex text-foreground text-center my-2'>
						AI-powered trivia games for trade shows and events.
					</p>
					<p className='flex justify-center items-center'>
						Built by{' '}
						<a
							href='https://naknick.com'
							target='_blank'
							rel='noopener noreferrer'
							className='text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors'
						>
							<img
								// src='/assets/owl.svg'
								src='/assets/naknick-logo.png'
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
