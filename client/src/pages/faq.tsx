import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import {
	Users,
	Target,
	TrendingUp,
	Award,
	Clock,
	Zap,
	Shield,
	Smartphone,
	BarChart3,
	Gamepad2,
	Brain,
	Share2,
	DollarSign,
	CheckCircle,
	HelpCircle,
	Lightbulb,
	Users2,
	ChartBar,
	QrCode,
	Calendar,
} from 'lucide-react'

export default function FAQ() {
	// FAQ categories organized by topic
	const faqCategories = [
		{
			title: 'Trade Show & Event Focus',
			icon: Target,
			questions: [
				{
					question:
						'How can QuizBooth specifically help vendors at trade shows?',
					answer:
						'QuizBooth is designed specifically for trade show environments to help vendors stand out, engage attendees, and capture qualified leads. Unlike generic trivia apps, our platform focuses on business-to-business engagement with features like lead capture, company-specific content generation, and event-ready distribution tools.',
				},
				{
					question:
						'What makes QuizBooth better than traditional lead capture methods?',
					answer:
						'Traditional lead capture methods like business card drops or sign-up sheets are passive and often ignored. QuizBooth creates active engagement where attendees voluntarily provide contact information while having fun. This results in higher quality leads who are genuinely interested in your products or services.',
				},
				{
					question: 'How quickly can I set up a game for my trade show booth?',
					answer:
						'Most vendors can create and deploy a fully customized trivia game in under 2 minutes using our AI-powered question generation. Simply provide your company information, select your industry, and our AI will generate relevant questions automatically. QR codes and shareable links are generated instantly.',
				},
				{
					question:
						'Can I customize the trivia questions for my specific industry?',
					answer:
						'Absolutely! QuizBooth supports industry-specific question generation across hundreds of industries. Our AI understands industry terminology, trends, and best practices to create relevant and engaging content that resonates with your target audience.',
				},
			],
		},
		{
			title: 'Vendor Benefits & ROI',
			icon: DollarSign,
			questions: [
				{
					question: 'What are the key benefits for trade show vendors?',
					answer:
						'Vendors benefit from: 1) Increased booth traffic and dwell time, 2) Higher quality lead generation, 3) Brand awareness and engagement, 4) Competitive differentiation, 5) Measurable ROI through analytics, 6) Cost-effective alternative to expensive booth activities.',
				},
				{
					question: 'How does QuizBooth help with lead qualification?',
					answer:
						'Our platform provides engagement metrics that help qualify leads. You can see which attendees completed the game, their scores, time spent, and engagement level. This data helps your sales team prioritize follow-ups with the most engaged prospects.',
				},
				{
					question: 'Can I measure the ROI of using QuizBooth at my events?',
					answer:
						'Yes! QuizBooth provides comprehensive analytics including: number of plays, completion rates, average scores, time spent per game, and lead conversion metrics. You can track engagement patterns and measure the direct impact on your trade show success.',
				},
				{
					question:
						'How does QuizBooth compare to hiring event staff or expensive activations?',
					answer:
						'QuizBooth provides 24/7 engagement at a fraction of the cost of additional staff or complex activations. It works continuously throughout the event, engages multiple attendees simultaneously, and requires minimal supervision while delivering consistent results.',
				},
			],
		},
		{
			title: 'Technical & Setup Questions',
			icon: Zap,
			questions: [
				{
					question:
						'What technology do I need to use QuizBooth at my trade show?',
					answer:
						'You only need a smartphone or tablet with internet access. Attendees can play using their own devices via QR codes, or you can set up a dedicated device at your booth. No special hardware or complex setup required.',
				},
				{
					question:
						'How reliable is the platform during busy trade show hours?',
					answer:
						'QuizBooth is built on enterprise-grade infrastructure with automatic scaling to handle peak traffic. We use Firebase with real-time databases and global CDN distribution to ensure fast, reliable performance even during the busiest event hours.',
				},
				{
					question: 'Can attendees play without downloading an app?',
					answer:
						'Yes! QuizBooth is completely web-based and works in any modern browser. Attendees simply scan a QR code or click a link to start playing immediately - no app downloads or installations required.',
				},
				{
					question: 'How do I share my trivia game with event attendees?',
					answer:
						'We provide multiple sharing options: 1) Dynamic QR codes for easy scanning, 2) Short URLs for verbal sharing, 3) Embed codes for your website, 4) Social media sharing links. Most vendors use QR codes displayed at their booth for maximum convenience.',
				},
			],
		},
		{
			title: 'Content & Customization',
			icon: Brain,
			questions: [
				{
					question:
						'How does the AI generate relevant questions for my business?',
					answer:
						'Our AI analyzes your company information, industry, and product details to create contextually appropriate questions. It uses advanced natural language processing to understand your business and generate engaging, accurate trivia content that showcases your expertise.',
				},
				{
					question: 'Can I edit or add my own custom questions?',
					answer:
						'Yes! While our AI generates great starting content, you have full control to edit any question, add custom questions, or modify answers. This ensures the trivia perfectly aligns with your messaging and brand voice.',
				},
				{
					question:
						'What types of questions work best for trade show audiences?',
					answer:
						'We recommend a mix of company-specific questions (highlighting your expertise), industry knowledge (engaging professionals), and fun facts (keeping it entertaining). The ideal balance depends on your audience and goals, which our platform helps you achieve.',
				},
				{
					question: 'How many questions should I include in my trivia game?',
					answer:
						'For trade show environments, we recommend 5-10 questions. This provides enough engagement without overwhelming attendees who may be moving between booths. Shorter games have higher completion rates and better lead capture results.',
				},
			],
		},
		{
			title: 'Analytics & Results',
			icon: BarChart3,
			questions: [
				{
					question: 'What kind of analytics does QuizBooth provide?',
					answer:
						'We provide comprehensive analytics including: total plays, completion rates, average scores, time spent, engagement patterns, lead capture data, and performance comparisons. You can track real-time engagement during events and access detailed reports afterward.',
				},
				{
					question:
						'How do I access the leads captured through the trivia games?',
					answer:
						'All captured leads are securely stored in your dashboard with export options. You can download contact information, engagement scores, and timestamps for easy integration with your CRM or sales follow-up processes.',
				},
				{
					question: 'Can I see which questions were most engaging?',
					answer:
						'Yes! Our analytics show question-level performance including correct/incorrect rates, time spent per question, and engagement metrics. This helps you understand what content resonates best with your audience.',
				},
				{
					question: 'How does the leaderboard feature benefit vendors?',
					answer:
						'The leaderboard creates friendly competition that increases engagement and repeat plays. Attendees often return to improve their scores, giving you multiple touchpoints and increasing the likelihood of meaningful conversations at your booth.',
				},
			],
		},
		{
			title: 'Pricing & Support',
			icon: Shield,
			questions: [
				{
					question: 'Is there a free trial available?',
					answer:
						'Yes! We offer a free trial that allows you to create and test games with full functionality. This lets you experience the platform and see the engagement results before committing to a paid plan.',
				},
				{
					question: 'What support is available during my trade show?',
					answer:
						'We provide dedicated support during event hours to ensure everything runs smoothly. This includes technical assistance, content guidance, and rapid response to any questions or issues that may arise.',
				},
				{
					question: 'Can I use QuizBooth for multiple events?',
					answer:
						'Absolutely! Your account supports unlimited games across multiple events. You can reuse successful game templates or create new ones for different shows, audiences, or marketing campaigns.',
				},
				{
					question: 'How does pricing work for enterprise clients?',
					answer:
						'We offer flexible enterprise pricing based on your specific needs, including volume discounts, white-label options, custom integrations, and dedicated account management for larger organizations.',
				},
			],
		},
	]

	// Key benefits for trade show vendors
	const vendorBenefits = [
		{
			icon: Users2,
			title: 'Increased Booth Traffic',
			description:
				'Attract more visitors with engaging trivia that stands out from traditional booth activities',
		},
		{
			icon: ChartBar,
			title: 'Qualified Lead Generation',
			description:
				'Capture contact information from genuinely interested prospects through voluntary participation',
		},
		{
			icon: Award,
			title: 'Brand Differentiation',
			description:
				'Stand out from competitors with innovative, tech-forward engagement that positions your brand as modern and customer-focused',
		},
		{
			icon: Clock,
			title: 'Extended Dwell Time',
			description:
				'Keep attendees at your booth longer with compelling content that encourages exploration and conversation',
		},
		{
			icon: QrCode,
			title: 'Easy Distribution',
			description:
				'Quick setup with QR codes and shareable links that work instantly without complex installations',
		},
		{
			icon: Calendar,
			title: 'Event Analytics',
			description:
				'Measure engagement, track performance, and demonstrate ROI with comprehensive event-specific analytics',
		},
	]

	return (
		<>
			<Helmet>
				<title>
					FAQ - QuizBooth for Trade Shows & Events | Vendor Benefits
				</title>
				<meta
					name='description'
					content='Frequently asked questions about QuizBooth for trade show vendors. Learn about lead capture, ROI, setup, and benefits for event marketing and engagement.'
				/>
				<meta
					property='og:title'
					content='FAQ - QuizBooth for Trade Shows & Events | Vendor Benefits'
				/>
				<meta
					property='og:description'
					content='Get answers about using QuizBooth for trade show success. Vendor benefits, lead generation, analytics, and event engagement strategies.'
				/>
				<meta property='og:url' content='https://quizbooth.games/faq' />
				<meta name='twitter:card' content='summary_large_image' />
				<link rel='canonical' href='https://quizbooth.games/faq' />
			</Helmet>

			<div className='flex-1 flex flex-col'>
				{/* Hero Section */}
				<section className='relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10'>
					<div className='max-w-6xl mx-auto text-center'>
						<div className='mb-8'>
							<Badge variant='secondary' className='mb-4 text-sm'>
								Trade Show Focused
							</Badge>
							<h1 className='text-4xl md:text-5xl font-bold text-foreground mb-6'>
								Frequently Asked Questions
							</h1>
							<p className='text-xl text-foreground max-w-3xl mx-auto leading-relaxed'>
								Everything you need to know about using QuizBooth for trade
								shows and events. Learn how to engage attendees, capture leads,
								and maximize your event ROI.
							</p>
						</div>
					</div>
				</section>

				{/* Vendor Benefits Section */}
				<section className='py-12 px-4 sm:px-6 lg:px-8'>
					<div className='max-w-6xl mx-auto'>
						<div className='text-center mb-12'>
							<h2 className='text-3xl font-bold text-foreground mb-4'>
								Key Benefits for Trade Show Vendors
							</h2>
							<p className='text-lg text-foreground max-w-2xl mx-auto'>
								Discover how QuizBooth transforms your trade show presence with
								measurable results and enhanced engagement.
							</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{vendorBenefits.map((benefit, index) => (
								<Card
									key={benefit.title}
									className='text-center hover:shadow-lg transition-shadow duration-300'
								>
									<CardHeader>
										<div className='flex justify-center mb-4'>
											<div className='p-3 bg-primary/10 rounded-full border-2 border-primary'>
												<benefit.icon className='h-6 w-6 text-primary' />
											</div>
										</div>
										<CardTitle className='text-lg'>{benefit.title}</CardTitle>
									</CardHeader>
									<CardContent>
										<p className='text-foreground text-sm'>
											{benefit.description}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* FAQ Sections */}
				<section className='py-12 px-4 sm:px-6 lg:px-8 bg-muted/30'>
					<div className='max-w-6xl mx-auto'>
						<div className='space-y-12'>
							{faqCategories.map((category, categoryIndex) => (
								<div key={category.title}>
									<div className='flex items-center gap-3 mb-6'>
										<category.icon className='h-6 w-6 text-primary' />
										<h2 className='text-2xl font-bold text-foreground'>
											{category.title}
										</h2>
									</div>

									<Accordion type='single' collapsible className='space-y-4'>
										{category.questions.map((faq, faqIndex) => (
											<AccordionItem
												key={faqIndex}
												value={`item-${categoryIndex}-${faqIndex}`}
												className='border rounded-lg px-4 bg-background'
											>
												<AccordionTrigger className='text-left hover:no-underline py-4'>
													<div className='flex items-start gap-3'>
														<HelpCircle className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
														<span className='font-semibold text-foreground'>
															{faq.question}
														</span>
													</div>
												</AccordionTrigger>
												<AccordionContent className='pb-4'>
													<div className='flex items-start gap-3 pl-8'>
														<Lightbulb className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
														<p className='text-foreground leading-relaxed'>
															{faq.answer}
														</p>
													</div>
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className='py-12 px-4 sm:px-6 lg:px-8'>
					<div className='max-w-4xl mx-auto text-center'>
						<div className='bg-primary/5 rounded-2xl p-8'>
							<h2 className='text-3xl font-bold text-foreground mb-4'>
								Ready to Transform Your Trade Show Experience?
							</h2>
							<p className='text-lg text-foreground mb-6 max-w-2xl mx-auto'>
								Join hundreds of vendors who are using QuizBooth to stand out,
								engage attendees, and capture qualified leads at their events.
							</p>
							<div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
								<Badge variant='secondary' className='text-sm py-2'>
									<CheckCircle className='h-4 w-4 mr-2' />
									No credit card required for trial
								</Badge>
								<Badge variant='secondary' className='text-sm py-2'>
									<Zap className='h-4 w-4 mr-2' />
									Set up in under 5 minutes
								</Badge>
								<Badge variant='secondary' className='text-sm py-2'>
									<Shield className='h-4 w-4 mr-2' />
									Enterprise-grade security
								</Badge>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	)
}
