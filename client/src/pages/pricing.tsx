import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Check,
	Crown,
	Zap,
	Users,
	Gamepad2,
	Brain,
	BarChart3,
	Share2,
	Shield,
	Clock,
	Star,
	Sparkles,
} from 'lucide-react'

export default function Pricing() {
	const pricingPlans = [
		{
			name: 'Starter Plan (Free)',
			description: 'Perfect for small events and getting started',
			price: 'Free',
			period: 'forever',
			popular: false,
			features: [
				'5 games',
				'10 questions per game',
				'Basic AI question generation',
				'Leaderboards',
				'QR code sharing',
				'Basic analytics',
			],
			cta: 'Get Started Free',
			highlight: false,
		},
		{
			name: 'Professional Plan',
			description: 'Ideal for regular trade shows and events',
			price: '$19',
			period: 'per month',
			popular: true,
			features: [
				'25 Games per month',
				'20 Questions per Game',
				'Advanced AI question generation',
				'Question editing',
				'Real-time leaderboards',
				'Custom branding (remove QuizBooth branding)',
				'Timer Customization per game',
				'Lead capture & CSV export',
				'Custom prize tiers',
				'Advanced analytics dashboard',
				'Dedicated support',
			],
			cta: 'Start Premium Trial',
			highlight: true,
		},
		{
			name: 'Pay As You Go',
			description: 'Flexible pricing for occasional events',
			price: '$9',
			period: 'per game',
			popular: false,
			features: [
				'Pay only for what you use',
				'All Premium features included',
				'No monthly commitment',
				'Perfect for one-off events',
				'Priority support included',
			],
			cta: 'Create Game',
			highlight: false,
		},
	]

	const features = [
		{
			icon: Brain,
			title: 'AI-Powered Questions',
			description: 'Intelligent question generation tailored to your business',
		},
		{
			icon: Gamepad2,
			title: 'Engaging Gameplay',
			description: 'Immersive trivia experience with timer and scoring',
		},
		{
			icon: BarChart3,
			title: 'Advanced Analytics',
			description: 'Track engagement, leads, and player performance',
		},
		{
			icon: Share2,
			title: 'Easy Sharing',
			description: 'QR codes and embed options for any platform',
		},
		{
			icon: Shield,
			title: 'Enterprise Security',
			description: 'Secure authentication and data protection',
		},
		{
			icon: Clock,
			title: 'Timer System',
			description: 'Resume capability prevents cheating and improves UX',
		},
	]

	return (
		<>
			<Helmet>
				<title>Pricing - QuizBooth Plans for Trade Show Trivia Games</title>
				<meta
					name='description'
					content='Choose the perfect QuizBooth plan for your trade show needs. Free Basic plan, Premium monthly subscription, or flexible Pay As You Go pricing.'
				/>
				<meta
					property='og:title'
					content='Pricing - QuizBooth Plans for Trade Show Trivia Games'
				/>
				<meta
					property='og:description'
					content="Flexible pricing options for QuizBooth's AI-powered trivia platform. Free, Premium, and Pay As You Go plans available."
				/>
				<meta property='og:url' content='https://quizbooth.games/pricing' />
				<meta name='twitter:card' content='summary_large_image' />
				<link rel='canonical' href='https://quizbooth.games/pricing' />
			</Helmet>

			<div className='flex-1 flex flex-col'>
				{/* Hero Section */}
				<section className='relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10'>
					<div className='max-w-6xl mx-auto text-center'>
						<div className='mb-8'>
							<Badge variant='secondary' className='mb-4 text-sm'>
								🚀 Beta Version • Currently Free for All Plans
							</Badge>
							<h1 className='text-4xl md:text-5xl font-bold text-foreground mb-6'>
								Simple, Transparent{' '}
								<span className='text-primary'>Pricing</span>
							</h1>
							<p className='text-xl text-foreground max-w-3xl mx-auto leading-relaxed'>
								Choose the plan that works best for your trade show and event
								needs. All plans include our full feature set during the beta
								period.
							</p>
						</div>
					</div>
				</section>

				{/* Pricing Plans */}
				<section className='py-12 px-4 sm:px-6 lg:px-8'>
					<div className='max-w-6xl mx-auto'>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
							{pricingPlans.map((plan, index) => (
								<Card
									key={plan.name}
									className={`relative ${
										plan.highlight
											? 'border-primary shadow-lg scale-105'
											: 'border-border'
									} transition-all duration-300 hover:shadow-xl`}
								>
									{plan.popular && (
										<div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
											<Badge className='bg-primary text-primary-foreground px-4 py-1'>
												<Crown className='h-3 w-3 mr-1' />
												Most Popular
											</Badge>
										</div>
									)}
									<CardHeader className='text-center pb-4'>
										<CardTitle className='flex items-center justify-center gap-2 text-2xl'>
											{plan.name === 'Premium' && (
												<Sparkles className='h-5 w-5 text-primary' />
											)}
											{plan.name}
										</CardTitle>
										<p className='text-muted-foreground mt-2'>
											{plan.description}
										</p>
										<div className='mt-6'>
											<div className='flex items-baseline justify-center gap-1'>
												<span className='text-4xl font-bold text-foreground'>
													{plan.price}
												</span>
												<span className='text-muted-foreground'>
													{plan.period}
												</span>
											</div>
										</div>
									</CardHeader>
									<CardContent className='pt-4'>
										<ul className='space-y-3 mb-8'>
											{plan.features.map((feature, featureIndex) => (
												<li
													key={featureIndex}
													className='flex items-start gap-3'
												>
													<Check className='h-5 w-5 text-green-500 mt-0.5 flex-shrink-0' />
													<span className='text-foreground'>{feature}</span>
												</li>
											))}
										</ul>
										<Button
											className={`w-full ${
												plan.highlight
													? 'bg-primary hover:bg-primary/90'
													: 'bg-primary/80 hover:bg-primary/60'
											}`}
											size='lg'
										>
											{plan.cta}
										</Button>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Beta Notice */}
						<div className='mt-12 text-center'>
							<Card className='bg-green-50 border-green-200'>
								<CardContent className='pt-6'>
									<div className='flex items-center justify-center gap-3 mb-4'>
										<Zap className='h-6 w-6 text-green-600' />
										<h3 className='text-xl font-semibold text-green-800'>
											Beta Program Notice
										</h3>
									</div>
									<p className='text-green-700 max-w-2xl mx-auto'>
										During our beta period, all plans are completely free! This
										includes unlimited games, premium features, and priority
										support. We're gathering feedback to improve the platform
										before launching our official pricing.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Features Overview */}
				<section className='py-12 px-4 sm:px-6 lg:px-8 bg-muted/30'>
					<div className='max-w-6xl mx-auto'>
						<div className='text-center mb-12'>
							<h2 className='text-3xl font-bold text-foreground mb-4'>
								Everything You Need for Successful Events
							</h2>
							<p className='text-lg text-foreground max-w-2xl mx-auto'>
								All plans include our complete suite of features designed
								specifically for trade show engagement and lead generation.
							</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{features.map((feature, index) => (
								<div
									key={feature.title}
									className='flex flex-col items-center text-center p-6'
								>
									<div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4'>
										<feature.icon className='h-6 w-6 text-primary' />
									</div>
									<h3 className='text-xl font-semibold text-foreground mb-2'>
										{feature.title}
									</h3>
									<p className='text-muted-foreground'>{feature.description}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className='py-12 px-4 sm:px-6 lg:px-8'>
					<div className='max-w-4xl mx-auto'>
						<div className='text-center mb-12'>
							<h2 className='text-3xl font-bold text-foreground mb-4'>
								Frequently Asked Questions
							</h2>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>
										How long will the beta be free?
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground'>
										The beta period will be free for at least one month. We'll
										provide 30 days notice before any pricing changes take
										effect.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>
										Can I switch between plans?
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground'>
										Yes! You can upgrade, downgrade, or switch to Pay As You Go
										at any time. Changes take effect immediately.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>
										What happens to my games if I cancel?
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground'>
										Your games and data are preserved. You can access them if
										you resubscribe, or export your data before canceling.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='text-lg'>
										Is there a limit to players per game?
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground'>
										No! All plans support unlimited players per game. Perfect
										for large trade shows and events.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className='py-12 px-4 sm:px-6 lg:px-8 bg-primary/5'>
					<div className='max-w-4xl mx-auto text-center'>
						<h2 className='text-3xl font-bold text-foreground mb-6'>
							Ready to Engage Your Audience?
						</h2>
						<p className='text-lg text-foreground mb-8 max-w-2xl mx-auto'>
							Join the beta today and create your first AI-powered trivia game
							for free. No credit card required.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Button size='lg' className='bg-primary hover:bg-primary/90'>
								<Star className='h-4 w-4 mr-2' />
								Start Free Beta
							</Button>
							<Button variant='outline' size='lg'>
								Learn More About Features
							</Button>
						</div>
					</div>
				</section>
			</div>
		</>
	)
}
