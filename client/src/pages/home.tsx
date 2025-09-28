import { Link } from 'wouter'
import { Helmet } from 'react-helmet-async'
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
	Brain,
	UserPlus,
	Share2,
} from 'lucide-react'
import { ShareEmbedModal } from '@/components/share-embed-modal'
import { useAuth } from '@/contexts/auth-context'

export default function Home() {
	const { isAuthenticated, user, loading } = useAuth()

	// Static stats data - will be replaced with real data later
	const stats = [
		{ label: 'Games created', value: '19', icon: Gamepad2 },
		{ label: 'Plays this week', value: '251', icon: Play },
		{ label: 'Average completion rate', value: '85%', icon: Trophy },
	]

	// Value proposition features
	const features = [
		{
			icon: Brain,
			title: 'AI-Powered Questions',
			description:
				'Never run out of engaging content. Our AI generates unique questions in seconds.',
		},
		{
			icon: UserPlus,
			title: 'Lead Capture',
			description:
				'Turn players into leads. Seamlessly collect contact information at your event.',
		},
		{
			icon: Share2,
			title: 'Easy Sharing',
			description:
				'Go live in seconds. Share your game via QR code or a simple link.',
		},
	]

	return (
		<>
			<Helmet>
				<title>
					QuizBooth - Create Engaging Trivia Games for Your Business
				</title>
				<meta
					name='description'
					content='Create AI-powered custom trivia games for trade shows and events. Engage customers, capture leads, and drive business growth through interactive gameplay.'
				/>
				<meta
					property='og:title'
					content='QuizBooth - Create Engaging Trivia Games for Your Business'
				/>
				<meta
					property='og:description'
					content='Create AI-powered custom trivia games for trade shows and events. Engage customers, capture leads, and drive business growth through interactive gameplay.'
				/>
				<meta property='og:url' content='https://quizbooth.games' />
				<meta
					name='twitter:title'
					content='QuizBooth - Create Engaging Trivia Games for Your Business'
				/>
				<meta
					name='twitter:description'
					content='Create AI-powered custom trivia games for trade shows and events. Engage customers, capture leads, and drive business growth through interactive gameplay.'
				/>
				<link rel='canonical' href='https://quizbooth.games' />
			</Helmet>
			<div className='flex-1 justify-center flex flex-col '>
				{/* Hero Section */}
				<section className='relative pt-4 md:pt-0 px-4 md:px-8'>
					<div className='max-w-5xl mx-auto'>
						<div className='text-center relative z-10'>
							<div className='mb-8 animate-slide-up'>
								<h1 className='text-h1 text-foreground my-6 '>
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
								className='flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up'
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

								<ShareEmbedModal isBuilder={true} />
							</div>
						</div>
					</div>
				</section>

				{/* Live Stats Section */}
				{/* <section className='relative pt-4 lg:pt-0 px-4 sm:px-6 lg:px-8'>
				<div className='max-w-7xl mx-auto'>
					<div className='text-center mb-12'>
						<h2 className='text-3xl font-bold '>Live Stats</h2>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
						{stats.map((stat, index) => (
							<Card
								key={stat.label}
								className='text-center p-6 animate-slide-up'
								style={{ animationDelay: `${0.1 * index}s` }}
							>
								<CardContent className='p-0'>
									<div className='flex justify-center mb-4'>
										<stat.icon className='h-12 w-12 text-primary' />
									</div>
									<h3 className='text-4xl font-bold text-foreground mb-2'>
										{stat.value}
									</h3>
									<p className='text-lg text-muted-foreground'>{stat.label}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section> */}

				{/* Value Proposition Section */}
				<section className='relative pt-4 lg:pt-0 px-4 sm:px-6 lg:px-8 my-4'>
					<div className='max-w-5xl mx-auto'>
						<div className='text-center mb-4 md:mb-16'>
							<h2 className='text-2xl md:text-3xl font-bold text-foreground my-4 md:my-8'>
								Why Choose QuizBooth?
							</h2>
						</div>

						<ul className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{features.map((feature, index) => (
								<li
									key={feature.title}
									className='text-center animate-slide-up'
									style={{ animationDelay: `${0.1 * index}s` }}
								>
									<div className='flex justify-center mb-4'>
										<div className='p-2 md:p-3 bg-primary/10 rounded-full border-2 border-primary'>
											<feature.icon className='h-4 w-4 md:h-8 md:w-8 text-primary ' />
										</div>
									</div>
									<h3 className='text-xl font-semibold text-foreground mb-3'>
										{feature.title}
									</h3>
									<p className='text-primary leading-relaxed'>
										{feature.description}
									</p>
								</li>
							))}
						</ul>
					</div>
				</section>
			</div>
		</>
	)
}
