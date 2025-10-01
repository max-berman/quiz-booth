import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Brain,
	Gamepad2,
	Trophy,
	Users,
	Share2,
	Zap,
	BarChart3,
	Smartphone,
	Shield,
	Target,
	Sparkles,
	Code,
	Database,
	Cpu,
	SmartphoneIcon,
	TrendingUp,
	Award,
	Clock,
	CheckCircle,
	Star,
	GitBranch,
	Package,
} from 'lucide-react'

export default function About() {
	const appVersion = '1.0.0-beta.1'
	const lastUpdated = 'October 2025'

	// Core features organized by category
	const featureCategories = [
		{
			title: 'AI-Powered Question Generation',
			icon: Brain,
			features: [
				'DeepSeek AI Integration for intelligent question generation',
				'Category-specific prompts (Company Facts, Industry Knowledge, Fun Facts)',
				'Website-based company detection for accurate content',
				'Batch question generation with duplicate prevention',
				'Answer option shuffling and explanation generation',
				'Levenshtein distance-based similarity checking',
			],
		},
		{
			title: 'Game Creation & Management',
			icon: Gamepad2,
			features: [
				'Multi-step game creation wizard',
				'Flexible prize system with multiple tiers',
				'AI-generated game titles',
				'User dashboard for game management',
				'Real-time play count tracking',
				'Question editing and regeneration',
			],
		},
		{
			title: 'Player Experience & Engagement',
			icon: Users,
			features: [
				'Immersive gameplay interface with hidden headers',
				'Multiple choice questions with randomized answers',
				'Real-time scoring and progress tracking',
				'Comprehensive results with answer explanations',
				'Mobile-optimized responsive design',
				'Time tracking and performance analytics',
			],
		},
		{
			title: 'Leaderboard & Analytics',
			icon: BarChart3,
			features: [
				'Real-time game-specific leaderboards',
				'Global cross-game rankings',
				'Intelligent caching with 30-second TTL',
				'Player submissions and engagement tracking',
				'Lead capture for trade show events',
				'Creator analytics and performance metrics',
			],
		},
		{
			title: 'Sharing & Distribution',
			icon: Share2,
			features: [
				'Dynamic QR code generation',
				'Shareable embed codes for websites',
				'Public URLs for direct game access',
				'Event-ready distribution system',
				'Brand customization options',
				'Quick setup for immediate event use',
			],
		},
		{
			title: 'Technical Architecture',
			icon: Cpu,
			features: [
				'Full-stack TypeScript with React 18',
				'Firebase Firestore real-time database',
				'Performance-optimized caching system',
				'Intelligent code splitting and lazy loading',
				'Comprehensive error handling and logging',
				'Rate limiting and security protections',
			],
		},
	]

	// Recent updates and version history
	const versionHistory = [
		{
			version: '1.0.0',
			date: 'October 2025',
			changes: [
				'Complete UI redesign with modern components',
				'Enhanced AI question generation with DeepSeek integration',
				'Advanced leaderboard system with real-time updates',
				'Improved mobile optimization and PWA support',
				'Comprehensive analytics and tracking system',
				'Performance optimizations and caching improvements',
				'Timer system with resume capability to prevent cheating',
				'Interval-based timer state saving for reliability',
				'Page unload protection for timer persistence',
				'Safety buffer implementation for timer resumption',
			],
		},
		{
			version: '0.5.0',
			date: 'August 2025',
			changes: [
				'Initial Firebase authentication integration',
				'Basic question generation system',
				'Simple game creation workflow',
				'Foundation for leaderboard functionality',
			],
		},
	]

	return (
		<>
			<Helmet>
				<title>About QuizBooth - AI-Powered Trivia Games for Trade Shows</title>
				<meta
					name='description'
					content="Learn about QuizBooth's comprehensive features for creating engaging trivia games. AI-powered question generation, lead capture, analytics, and more for trade shows and events."
				/>
				<meta
					property='og:title'
					content='About QuizBooth - AI-Powered Trivia Games for Trade Shows'
				/>
				<meta
					property='og:description'
					content="Discover QuizBooth's complete feature set for creating interactive trivia experiences at trade shows and events."
				/>
				<meta property='og:url' content='https://quizbooth.games/about' />
				<meta name='twitter:card' content='summary_large_image' />
				<link rel='canonical' href='https://quizbooth.games/about' />
			</Helmet>

			<div className='flex-1 flex flex-col'>
				{/* Hero Section */}
				<section className='relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10'>
					<div className='max-w-6xl mx-auto text-center'>
						<div className='mb-8'>
							<div className='flex flex-col sm:flex-row gap-2 justify-center items-center mb-4'>
								<Badge variant='secondary' className='text-sm'>
									Version {appVersion} • Last Updated {lastUpdated}
								</Badge>
								<Badge
									variant='default'
									className='text-sm bg-green-500 text-white'
								>
									🚀 Beta Version • Currently Free
								</Badge>
							</div>
							<h1 className='text-4xl md:text-5xl font-bold text-foreground mb-6'>
								About <span className='text-primary'>QuizBooth</span>
							</h1>
							<p className='text-xl text-foreground max-w-3xl mx-auto leading-relaxed'>
								QuizBooth is a comprehensive platform designed specifically for
								trade shows and events, combining AI-powered content generation
								with robust engagement tools to help businesses connect with
								their audience through interactive trivia experiences.
							</p>
						</div>
					</div>
				</section>

				{/* Version Information */}
				<section className='py-12 px-4 sm:px-6 lg:px-8'>
					<div className='max-w-6xl mx-auto'>
						<div className='text-center mb-12'>
							<h2 className='text-3xl font-bold text-foreground mb-4'>
								Version Information
							</h2>
							<div className='flex flex-col sm:flex-row justify-center items-center gap-4 mb-8'>
								<div className='flex items-center gap-2'>
									<Package className='h-5 w-5 text-primary' />
									<span className='text-lg font-semibold'>
										Current Version: {appVersion}
									</span>
								</div>
								<div className='flex items-center gap-2'>
									<Clock className='h-5 w-5 text-primary' />
									<span className='text-lg'>Last Updated: {lastUpdated}</span>
								</div>
							</div>
						</div>

						{/* Version Breakdown */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<GitBranch className='h-5 w-5 text-primary' />
										Version Type
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										<div className='flex justify-between'>
											<span className='font-medium'>Major Version:</span>
											<Badge variant='secondary'>2</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Minor Version:</span>
											<Badge variant='secondary'>0</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Patch Version:</span>
											<Badge variant='secondary'>0</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Pre-release:</span>
											<Badge variant='outline'>beta.1</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Shield className='h-5 w-5 text-primary' />
										Stability & Status
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										<div className='flex justify-between'>
											<span className='font-medium'>Release Status:</span>
											<Badge
												variant='default'
												className='bg-yellow-500 text-white'
											>
												Beta
											</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>API Stability:</span>
											<Badge variant='secondary'>Stable</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Production Ready:</span>
											<Badge variant='secondary'>Yes</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Free Tier:</span>
											<Badge variant='secondary'>Active</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Code className='h-5 w-5 text-primary' />
										Technical Details
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										<div className='flex justify-between'>
											<span className='font-medium'>React Version:</span>
											<Badge variant='secondary'>18.3.1</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>TypeScript:</span>
											<Badge variant='secondary'>5.6.3</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Firebase:</span>
											<Badge variant='secondary'>12.2.1</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Build Tool:</span>
											<Badge variant='secondary'>Vite 6.3.6</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<TrendingUp className='h-5 w-5 text-primary' />
										Next Release
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										<div className='flex justify-between'>
											<span className='font-medium'>Target Version:</span>
											<Badge variant='secondary'>2.0.0</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Timeline:</span>
											<Badge variant='outline'>Q4 2025</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Focus Areas:</span>
											<Badge variant='secondary'>Testing</Badge>
										</div>
										<div className='flex justify-between'>
											<span className='font-medium'>Breaking Changes:</span>
											<Badge variant='secondary'>None</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Version History */}
						<div className='space-y-8'>
							{versionHistory.map((version, index) => (
								<Card
									key={version.version}
									className='border-l-4 border-l-primary'
								>
									<CardHeader>
										<CardTitle className='flex items-center gap-3'>
											<GitBranch className='h-6 w-6 text-primary' />
											<span>Version {version.version}</span>
											<Badge variant='outline' className='ml-auto'>
												{version.date}
											</Badge>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className='space-y-2'>
											{version.changes.map((change, changeIndex) => (
												<li
													key={changeIndex}
													className='flex items-start gap-2'
												>
													<CheckCircle className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
													<span className='text-foreground'>{change}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* Features Overview */}
				<section className='py-12 px-4 sm:px-6 lg:px-8 bg-muted/30'>
					<div className='max-w-6xl mx-auto'>
						<div className='text-center mb-12'>
							<h2 className='text-3xl font-bold text-foreground mb-4'>
								Comprehensive Feature Set
							</h2>
							<p className='text-lg text-foreground max-w-2xl mx-auto'>
								QuizBooth offers a complete suite of tools designed specifically
								for trade show engagement and lead generation through
								interactive trivia experiences.
							</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{featureCategories.map((category, index) => (
								<Card
									key={category.title}
									className='hover:shadow-lg transition-shadow duration-300'
								>
									<CardHeader>
										<CardTitle className='flex items-center gap-3 text-lg'>
											<category.icon className='h-6 w-6 text-primary' />
											{category.title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<ul className='space-y-2'>
											{category.features.map((feature, featureIndex) => (
												<li
													key={featureIndex}
													className='flex items-start gap-2 text-sm'
												>
													<Star className='h-3 w-3 text-primary mt-1 flex-shrink-0' />
													<span className='text-foreground'>{feature}</span>
												</li>
											))}
										</ul>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* Technical Specifications */}
				{/* <section className='py-12 px-4 sm:px-6 lg:px-8'>
					<div className='max-w-6xl mx-auto'>
						<div className='text-center mb-12'>
							<h2 className='text-3xl font-bold text-foreground mb-4'>
								Technical Specifications
							</h2>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Code className='h-5 w-5 text-primary' />
										Frontend Technology
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<div className='flex justify-between'>
										<span className='font-medium'>Framework:</span>
										<Badge variant='secondary'>React 18</Badge>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium'>Language:</span>
										<Badge variant='secondary'>TypeScript</Badge>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium'>Build Tool:</span>
										<Badge variant='secondary'>Vite</Badge>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium'>Styling:</span>
										<Badge variant='secondary'>Tailwind CSS</Badge>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium'>UI Components:</span>
										<Badge variant='secondary'>Radix UI</Badge>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Database className='h-5 w-5 text-primary' />
										Backend & Infrastructure
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									<div className='flex justify-between'>
										<span className='font-medium'>Database:</span>
										<Badge variant='secondary'>Firebase Firestore</Badge>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium'>Authentication:</span>
										<Badge variant='secondary'>Firebase Auth</Badge>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium'>Functions:</span>
										<Badge variant='secondary'>Firebase Functions</Badge>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium'>Hosting:</span>
										<Badge variant='secondary'>Firebase Hosting</Badge>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium'>AI Integration:</span>
										<Badge variant='secondary'>DeepSeek API</Badge>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</section> */}

				{/* Call to Action */}
				<section className='py-12 px-4 sm:px-6 lg:px-8 bg-primary/5'>
					<div className='max-w-4xl mx-auto text-center'>
						<h2 className='text-3xl font-bold text-foreground mb-6'>
							Ready to Create Your First Game?
						</h2>
						<p className='text-lg text-foreground mb-8 max-w-2xl mx-auto'>
							Start exploring QuizBooth's features and create engaging trivia
							experiences for your events. As a new platform, we're excited to
							help you connect with your audience through interactive gameplay.
						</p>
						<div className='flex flex-col sm:flex-row gap-4 justify-center'>
							<Badge variant='secondary' className='text-sm py-2'>
								<Sparkles className='h-4 w-4 mr-2' />
								New platform with modern features
							</Badge>
							<Badge variant='secondary' className='text-sm py-2'>
								<Zap className='h-4 w-4 mr-2' />
								AI-powered question generation
							</Badge>
							<Badge variant='secondary' className='text-sm py-2'>
								<Shield className='h-4 w-4 mr-2' />
								Secure and reliable
							</Badge>
						</div>
					</div>
				</section>
			</div>
		</>
	)
}
