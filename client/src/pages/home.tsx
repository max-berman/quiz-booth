import { Link } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Gamepad2,
	Trophy,
	Users,
	Target,
	Star,
	ArrowRight,
	Zap,
	Sparkles,
	Play,
	LogIn,
	MonitorPlay,
} from 'lucide-react'
import { ShareEmbedModal } from '@/components/share-embed-modal'
import { useAuth } from '@/contexts/auth-context'

export default function Home() {
	const { isAuthenticated, user, loading } = useAuth()
	return (
		<div className='flex-1 justify-center flex flex-col min-h-0'>
			{/* Hero Section */}
			<section className='relative py-24 px-4 sm:px-6 lg:px-8'>
				<div className='max-w-7xl mx-auto'>
					<div className='text-center relative z-10'>
						<div className='mb-8 animate-slide-up'>
							<h1 className='text-h1 text-foreground mb-6 '>
								Create{' '}
								<span className='text-primary font-bold'>Trivia Games</span>
								<br />
								for your business
							</h1>

							<p className='text-xl text-foreground max-w-3xl mx-auto mb-12 leading-relaxed'>
								Engage your customers through play. Generate AI-powered custom
								trivia questions for your trade show booth and capture leads
								while visitors have fun competing for prizes.
							</p>
						</div>

						<div
							className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up'
							style={{ animationDelay: '0.2s' }}
						>
							<Link href='/setup'>
								<Button
									variant='default'
									className='px-8 py-3 w-full text-lg sm:w-auto'
								>
									<MonitorPlay className='mr-2 !h-6 !w-6' />
									Create Your Game
								</Button>
							</Link>

							<Link href='/leaderboard'>
								<Button
									variant='secondary'
									className='px-8 py-3 text-lg w-full sm:w-auto'
								>
									<Trophy className='mr-2 !h-6 !w-6' />
									View Leaderboard
								</Button>
							</Link>
						</div>

						<div
							className='animate-slide-up'
							style={{ animationDelay: '0.4s' }}
						>
							<ShareEmbedModal isBuilder={true} />
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
