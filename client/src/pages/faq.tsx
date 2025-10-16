import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
	ChevronDown,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function FAQ() {
	// FAQ categories organized by topic
	// TODO : And if you don't like AI generated questions you can always edit them out
	const faqCategories = [
		{
			title: 'Trade Show & Event Focus',
			icon: Target,
			questions: [
				{
					question:
						'How can QuizBooth specifically help vendors at trade shows?',
					answer:
						'QuizBooth is designed specifically for trade show environments to help vendors:\n\n**Stand out** from competitors with engaging trivia\n\n**Engage attendees** with interactive content\n\n**Capture qualified leads** through voluntary participation\n\nUnlike generic trivia apps, our platform focuses on business-to-business engagement with features like lead capture, company-specific content generation, and event-ready distribution tools.',
				},
				{
					question:
						'What makes QuizBooth better than traditional lead capture methods?',
					answer:
						'Traditional lead capture methods like business card drops or sign-up sheets are **passive** and often ignored. \n\nQuizBooth creates **active engagement** where attendees voluntarily provide contact information while having fun. \n\nThis results in **higher quality leads** who are genuinely interested in your products or services.',
				},
				{
					question: 'How quickly can I set up a game for my trade show booth?',
					answer:
						'Most vendors can create and deploy a fully customized trivia game in **under 2 minutes** using our AI-powered question generation.\n\n**Simple process:**\n1. Provide your company information\n2. Select your industry  \n3. AI generates relevant questions automatically\n4. QR codes and shareable links are generated instantly',
				},
				{
					question:
						'Can I customize the trivia questions for my specific industry?',
					answer:
						'**Absolutely!** QuizBooth supports industry-specific question generation across **hundreds of industries**.\n\nOur AI understands:\n- Industry terminology\n- Current trends  \n- Best practices\n\nThis creates relevant and engaging content that resonates with your target audience.',
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
						'Vendors benefit from:\n\n**Increased booth traffic** and dwell time\n\n**Higher quality lead generation**\n\n**Brand awareness** and engagement\n\n**Competitive differentiation**\n\n**Measurable ROI** through analytics\n\n**Cost-effective alternative** to expensive booth activities',
				},
				{
					question: 'How does QuizBooth help with lead qualification?',
					answer:
						'Our platform provides **engagement metrics** that help qualify leads:\n\n- See which attendees completed the game\n- Track their scores and time spent\n- Measure engagement level\n\nThis data helps your sales team **prioritize follow-ups** with the most engaged prospects.',
				},
				{
					question: 'Can I measure the ROI of using QuizBooth at my events?',
					answer:
						'**Yes!** QuizBooth provides comprehensive analytics including:\n\n- Number of plays\n- Completion rates\n- Average scores\n- Time spent per game\n- Lead conversion metrics\n\nYou can track engagement patterns and measure the **direct impact** on your trade show success.',
				},
				{
					question:
						'How does QuizBooth compare to hiring event staff or expensive activations?',
					answer:
						'QuizBooth provides:\n\n**24/7 engagement** at a fraction of the cost\n\n**Works continuously** throughout the event\n\n**Engages multiple attendees** simultaneously\n\n**Requires minimal supervision**\n\n**Delivers consistent results**\n\nCompared to additional staff or complex activations, QuizBooth is more cost-effective and scalable.',
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
						'**Minimal requirements:**\n\n- Smartphone or tablet with internet access\n- Attendees can use their own devices via QR codes\n- Option to set up a dedicated device at your booth\n\n**No special hardware** or complex setup required',
				},
				{
					question:
						'How reliable is the platform during busy trade show hours?',
					answer:
						'QuizBooth is built on **enterprise-grade infrastructure** with:\n\n- **Automatic scaling** to handle peak traffic\n- **Firebase** with real-time databases\n- **Global CDN distribution**\n\nThis ensures **fast, reliable performance** even during the busiest event hours.',
				},
				{
					question: 'Can attendees play without downloading an app?',
					answer:
						'**Yes!** QuizBooth is **completely web-based** and works in any modern browser.\n\nAttendees simply:\n- Scan a QR code **OR**\n- Click a link\n\n**No app downloads** or installations required',
				},
				{
					question: 'How do I share my trivia game with event attendees?',
					answer:
						'We provide **multiple sharing options**:\n\n1. **Dynamic QR codes** for easy scanning\n2. **Short URLs** for verbal sharing\n3. **Embed codes** for your website\n4. **Social media sharing** links\n\nMost vendors use **QR codes displayed at their booth** for maximum convenience.',
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
						'Our AI analyzes:\n\n- **Company information**\n- **Industry**\n- **Product details**\n\nIt uses **advanced natural language processing** to understand your business and generate:\n\n- **Engaging** trivia content\n- **Accurate** information\n- **Expertise-showcasing** questions',
				},
				{
					question: 'Can I edit or add my own custom questions?',
					answer:
						'**Yes!** While our AI generates great starting content, you have **full control** to:\n\n- **Edit** any question\n- **Add** custom questions\n- **Modify** answers\n\nThis ensures the trivia **perfectly aligns** with your messaging and brand voice.',
				},
				{
					question:
						'What types of questions work best for trade show audiences?',
					answer:
						'We recommend a **mix of question types**:\n\n**Company-specific** - Highlighting your expertise\n\n**Industry knowledge** - Engaging professionals\n\n**Fun facts** - Keeping it entertaining\n\nThe ideal balance depends on your audience and goals, which our platform helps you achieve.',
				},
				{
					question: 'How many questions should I include in my trivia game?',
					answer:
						'For trade show environments, we recommend **5-10 questions**.\n\nThis provides:\n\n- **Enough engagement** without overwhelming attendees\n- **Higher completion rates**\n- **Better lead capture** results\n\nShorter games work best for attendees moving between booths.',
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
						'We provide **comprehensive analytics** including:\n\n- **Total plays** and completion rates\n- **Average scores** and time spent\n- **Engagement patterns** and lead capture data\n- **Performance comparisons**\n\nYou can track **real-time engagement** during events and access detailed reports afterward.',
				},
				{
					question:
						'How do I access the leads captured through the trivia games?',
					answer:
						'All captured leads are **securely stored** in your dashboard with:\n\n- **Export options** for contact information\n- **Engagement scores** and timestamps\n- **Easy integration** with your CRM or sales processes\n\nDownload everything you need for follow-ups.',
				},
				{
					question: 'Can I see which questions were most engaging?',
					answer:
						'**Yes!** Our analytics show **question-level performance** including:\n\n- **Correct/incorrect rates**\n- **Time spent** per question\n- **Engagement metrics**\n\nThis helps you understand **what content resonates best** with your audience.',
				},
				{
					question: 'How does the leaderboard feature benefit vendors?',
					answer:
						'The leaderboard creates **friendly competition** that:\n\n- **Increases engagement** and repeat plays\n- **Encourages attendees** to return and improve scores\n- **Provides multiple touchpoints** for conversations\n- **Increases likelihood** of meaningful booth interactions',
				},
				{
					question: 'How are scores calculated in QuizBooth?',
					answer:
						'QuizBooth rewards both accuracy and speed with a simple scoring system:\n\n**Base Points:** 100 points for each correct answer\n\n**Time Bonus:** Up to 60 bonus points for answering quickly (2 points per second saved)\n\n**Streak Bonus:** 10 extra points for each consecutive correct answer\n\n**Example:** If you answer correctly in 10 seconds with a 3-question streak:\n- Base: 100 points\n- Time Bonus: 40 points (20 seconds saved × 2)\n- Streak Bonus: 30 points (3 × 10)\n- **Total:** 170 points for that question\n\nThis system creates fair competition while encouraging both knowledge and quick thinking.',
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
						'**Yes!** We offer a **free trial** that allows you to:\n\n- **Create and test games** with full functionality\n- **Experience the platform** firsthand\n- **See engagement results** before committing\n\nNo credit card required to get started.',
				},
				{
					question: 'What support is available during my trade show?',
					answer:
						'We provide **dedicated support** during event hours including:\n\n- **Technical assistance** for any issues\n- **Content guidance** and optimization\n- **Rapid response** to questions\n\nEverything runs smoothly with our support team available.',
				},
				{
					question: 'Can I use QuizBooth for multiple events?',
					answer:
						'**Absolutely!** Your account supports:\n\n- **Unlimited games** across multiple events\n- **Reuse successful templates**\n- **Create new games** for different shows\n- **Target different audiences** and campaigns\n\nOne account, endless possibilities.',
				},
				{
					question: 'How does pricing work for enterprise clients?',
					answer:
						'We offer **flexible enterprise pricing** including:\n\n- **Volume discounts** for larger organizations\n- **White-label options** for branding\n- **Custom integrations** with your systems\n- **Dedicated account management**\n\nContact us for a customized quote.',
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

									<div className='space-y-4'>
										{category.questions.map((faq, faqIndex) => (
											<details
												key={faqIndex}
												className='border rounded-lg px-4 bg-background group'
											>
												<summary className='cursor-pointer py-4 list-none'>
													<div className='flex items-start justify-between gap-3'>
														<div className='flex items-start gap-3 flex-1'>
															<HelpCircle className='h-5 w-5 text-primary mt-0.5 flex-shrink-0' />
															<span className='font-semibold text-foreground'>
																{faq.question}
															</span>
														</div>
														<ChevronDown className='h-5 w-5 text-primary mt-0.5 flex-shrink-0 transition-transform duration-200 group-open:rotate-180' />
													</div>
												</summary>
												<div className='pb-4'>
													<div className='flex items-start gap-3 pl-8 text-primary'>
														<Lightbulb className='h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' />
														<div className='text-primary leading-relaxed prose max-w-none'>
															<ReactMarkdown>{faq.answer}</ReactMarkdown>
														</div>
													</div>
												</div>
											</details>
										))}
									</div>
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
