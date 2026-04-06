/**
 * Simple SSR for marketing pages
 * Renders actual page components with SSR-safe implementations
 */

import { renderToString } from 'react-dom/server'
import React from 'react'

// SSR-safe Home page
const HomePageSSR = () => (
	<div>
		<h1>QuizBooth - Create Engaging Trivia Games for Your Business</h1>
		<p>
			Create AI-powered custom trivia games for trade shows and events. Engage
			customers, capture leads, and drive business growth through interactive
			gameplay.
		</p>

		<div>
			<h2>Why Choose QuizBooth?</h2>
			<ul>
				<li>AI-Powered Questions - Never run out of engaging content</li>
				<li>Lead Capture - Turn players into leads</li>
				<li>Easy Sharing - Go live in seconds with QR codes</li>
			</ul>
		</div>

		<section>
			<div>
				<div>
					<h1>
						Create <span>Trivia Games</span>
						<br />
						for your business
					</h1>
					<p>
						Engage your customers through play. Generate AI-powered custom
						trivia questions for your trade show booth and capture leads while
						visitors have fun competing for prizes.
					</p>
				</div>
				<div>
					<a href='/setup'>
						<button>Create Your Game</button>
					</a>
					<button
						aria-controls='radix-:r0:'
						aria-expanded='false'
						aria-haspopup='dialog'
						data-state='closed'
						type='button'
					>
						Share Trivia Builder
					</button>
				</div>
			</div>
		</section>
		<section>
			<div>
				<div>
					<h2>Why Choose QuizBooth?</h2>
				</div>
				<ul>
					<li>
						<h3>AI-Powered Questions</h3>
						<p>
							Never run out of engaging content. Our AI generates unique
							questions in seconds.
						</p>
					</li>
					<li>
						<h3>Lead Capture</h3>
						<p>
							Turn players into leads. Seamlessly collect contact information at
							your event.
						</p>
					</li>
					<li>
						<h3>Easy Sharing</h3>
						<p>
							Go live in seconds. Share your game via QR code or a simple link.
						</p>
					</li>
				</ul>
			</div>
		</section>
	</div>
)

// SSR-safe About page
const AboutPageSSR = () => (
	<div>
		<h1>About QuizBooth</h1>
		<p>
			QuizBooth is a comprehensive platform designed specifically for trade
			shows and events, combining AI-powered content generation with robust
			engagement tools to help businesses connect with their audience through
			interactive trivia experiences.
		</p>
		<div>
			<h2>Comprehensive Feature Set</h2>
			<ul>
				<li>AI-Powered Question Generation with DeepSeek AI Integration</li>
				<li>Game Creation & Management with multi-step wizard</li>
				<li>Player Experience & Engagement with mobile swipe gestures</li>
				<li>Security & Anti-Cheating with first completion lock</li>
				<li>Sharing & Distribution with dynamic QR code generation</li>
			</ul>
		</div>

		<section>
			<div>
				<div>
					<h2>Comprehensive Feature Set</h2>
					<p>
						QuizBooth offers a complete suite of tools designed specifically for
						trade show engagement and lead generation through interactive trivia
						experiences.
					</p>
				</div>
				<div>
					<div>
						<div>AI-Powered Question Generation</div>
						<div>
							<ul>
								<li>
									<span>
										DeepSeek AI Integration with fallback to OpenAI for
										intelligent question generation
									</span>
								</li>
								<li>
									<span>
										Category-specific prompts (Company Facts, Industry
										Knowledge, Fun Facts)
									</span>
								</li>
								<li>
									<span>
										Website-based company detection for accurate content
									</span>
								</li>
								<li>
									<span>
										Batch question generation with duplicate prevention
									</span>
								</li>
								<li>
									<span>
										Answer option shuffling and explanation generation
									</span>
								</li>
							</ul>
						</div>
					</div>
					<div>
						<div>Game Creation & Management</div>
						<div>
							<ul>
								<li>
									<span>Multi-step game creation wizard</span>
								</li>
								<li>
									<span>
										Flexible prize system with customizable placement tiers
									</span>
								</li>
								<li>
									<span>AI-generated game titles</span>
								</li>
								<li>
									<span>User dashboard for game management</span>
								</li>
								<li>
									<span>Real-time play count tracking</span>
								</li>
								<li>
									<span>Question editing and regeneration</span>
								</li>
							</ul>
						</div>
					</div>
					<div>
						<div>Player Experience & Engagement</div>
						<div>
							<ul>
								<li>
									<span>Immersive gameplay interface</span>
								</li>
								<li>
									<span>
										30-second timer with session persistence and resume
										capability
									</span>
								</li>
								<li>
									<span>Mobile swipe gestures and vibration feedback</span>
								</li>
								<li>
									<span>Real-time scoring and progress tracking</span>
								</li>
								<li>
									<span>Comprehensive results with answer explanations</span>
								</li>
								<li>
									<span>Mobile-optimized responsive design</span>
								</li>
							</ul>
						</div>
					</div>
					<div>
						<div>Security & Anti-Cheating</div>
						<div>
							<ul>
								<li>
									<span>
										First completion lock to prevent score manipulation
									</span>
								</li>
								<li>
									<span>Secure session-based results storage</span>
								</li>
								<li>
									<span>Server-side score validation</span>
								</li>
								<li>
									<span>Cross-device authentication and synchronization</span>
								</li>
								<li>
									<span>Rate limiting to prevent abuse and spam</span>
								</li>
								<li>
									<span>Real-time cheating detection</span>
								</li>
							</ul>
						</div>
					</div>
					<div>
						<div>Sharing & Distribution</div>
						<div>
							<ul>
								<li>
									<span>
										Dynamic QR code generation for easy event distribution
									</span>
								</li>
								<li>
									<span>Shareable embed codes for websites</span>
								</li>
								<li>
									<span>Public URLs for direct game access</span>
								</li>
								<li>
									<span>Event-ready distribution system</span>
								</li>
								<li>
									<span>Brand customization options</span>
								</li>
								<li>
									<span>Quick setup for immediate event use</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
)

// SSR-safe Pricing page
const PricingPageSSR = () => (
	<div>
		<h1>Simple, Transparent Pricing</h1>
		<p>
			Choose the plan that works best for your trade show and event needs. All
			plans include our full feature set during the beta period.
		</p>

		<div>
			<h2>Pricing Plans</h2>
			<ul>
				<li>Starter Plan (Free) - Perfect for small events</li>
				<li>Professional Plan - Ideal for regular trade shows</li>
				<li>Pay As You Go - Flexible pricing for occasional events</li>
			</ul>
		</div>
	</div>
)

// SSR-safe FAQ page
const FAQPageSSR = () => (
	<div>
		<h1>Frequently Asked Questions</h1>
		<p>
			Everything you need to know about using QuizBooth for trade shows and
			events. Learn how to engage attendees, capture leads, and maximize your
			event ROI.
		</p>

		<div>
			<h2>Key Benefits for Trade Show Vendors</h2>
			<ul>
				<li>
					Increased Booth Traffic - Attract more visitors with engaging trivia
				</li>
				<li>
					Qualified Lead Generation - Capture contact information from genuinely
					interested prospects
				</li>
				<li>
					Brand Differentiation - Stand out from competitors with innovative
					engagement
				</li>
				<li>Extended Dwell Time - Keep attendees at your booth longer</li>
				<li>
					Easy Distribution - Quick setup with QR codes and shareable links
				</li>
				<li>Event Analytics - Measure engagement and demonstrate ROI</li>
			</ul>
		</div>

		<section>
			<div>
				<div>
					<h2>Key Benefits for Trade Show Vendors</h2>
					<p>
						Discover how QuizBooth transforms your trade show presence with
						measurable results and enhanced engagement.
					</p>
				</div>
				<div>
					<div>
						<div>Increased Booth Traffic</div>
					</div>
					<div>
						<p>
							Attract more visitors with engaging trivia that stands out from
							traditional booth activities
						</p>
					</div>
				</div>
				<div>
					<div>
						<div>Qualified Lead Generation</div>
					</div>
					<div>
						<p>
							Capture contact information from genuinely interested prospects
							through voluntary participation
						</p>
					</div>
				</div>
				<div>
					<div>
						<div>Brand Differentiation</div>
					</div>
					<div>
						<p>
							Stand out from competitors with innovative, tech-forward
							engagement that positions your brand as modern and
							customer-focused
						</p>
					</div>
				</div>
				<div>
					<div>
						<div>Extended Dwell Time</div>
					</div>
					<div>
						<p>
							Keep attendees at your booth longer with compelling content that
							encourages exploration and conversation
						</p>
					</div>
				</div>
				<div>
					<div>
						<div>Easy Distribution</div>
					</div>
					<div>
						<p>
							Quick setup with QR codes and shareable links that work instantly
							without complex installations
						</p>
					</div>
				</div>
				<div>
					<div>
						<div>Event Analytics</div>
					</div>
					<div>
						<p>
							Measure engagement, track performance, and demonstrate ROI with
							comprehensive event-specific analytics
						</p>
					</div>
				</div>
			</div>
		</section>

		<section>
			<div>
				<div>
					<h2>Trade Show & Event Focus</h2>
				</div>
				<div>
					<details>
						<summary>
							<div>
								<div>
									<span>
										How can QuizBooth specifically help vendors at trade shows?
									</span>
								</div>
							</div>
						</summary>
						<div>
							<div>
								<p>
									QuizBooth is designed specifically for trade show environments
									to help vendors:
								</p>
								<p>
									<strong>Stand out</strong> from competitors with engaging
									trivia
								</p>
								<p>
									<strong>Engage attendees</strong> with interactive content
								</p>
								<p>
									<strong>Capture qualified leads</strong> through voluntary
									participation
								</p>
								<p>
									Unlike generic trivia apps, our platform focuses on
									business-to-business engagement with features like lead
									capture, company-specific content generation, and event-ready
									distribution tools.
								</p>
							</div>
						</div>
					</details>
					<details>
						<summary>
							<div>
								<div>
									<span>
										What makes QuizBooth better than traditional lead capture
										methods?
									</span>
								</div>
							</div>
						</summary>
						<div>
							<div>
								<p>
									Traditional lead capture methods like business card drops or
									sign-up sheets are <strong>passive</strong> and often ignored.
								</p>
								<p>
									QuizBooth creates <strong>active engagement</strong> where
									attendees voluntarily provide contact information while having
									fun.
								</p>
								<p>
									This results in <strong>higher quality leads</strong> who are
									genuinely interested in your products or services.
								</p>
							</div>
						</div>
					</details>
					<details>
						<summary>
							<div>
								<div>
									<span>
										How quickly can I set up a game for my trade show booth?
									</span>
								</div>
							</div>
						</summary>
						<div>
							<div>
								<p>
									Most vendors can create and deploy a fully customized trivia
									game in <strong>under 2 minutes</strong> using our AI-powered
									question generation.
								</p>
								<p>
									<strong>Simple process:</strong>
								</p>
								<ol>
									<li>Provide your company information</li>
									<li>Select your industry</li>
									<li>AI generates relevant questions automatically</li>
									<li>QR codes and shareable links are generated instantly</li>
								</ol>
							</div>
						</div>
					</details>
					<details>
						<summary>
							<div>
								<div>
									<span>
										Can I customize the trivia questions for my specific
										industry?
									</span>
								</div>
							</div>
						</summary>
						<div>
							<div>
								<p>
									<strong>Absolutely!</strong> QuizBooth supports
									industry-specific question generation across{' '}
									<strong>hundreds of industries</strong>.
								</p>
								<p>Our AI understands:</p>
								<ul>
									<li>Industry terminology</li>
									<li>Current trends</li>
									<li>Best practices</li>
								</ul>
								<p>
									This creates relevant and engaging content that resonates with
									your target audience.
								</p>
							</div>
						</div>
					</details>
				</div>
				<div>
					<div>
						<h2>Vendor Benefits & ROI</h2>
					</div>
					<div>
						<details>
							<summary>
								<div>
									<div>
										<span>
											What are the key benefits for trade show vendors?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>Vendors benefit from:</p>
									<p>
										<strong>Increased booth traffic</strong> and dwell time
									</p>
									<p>
										<strong>Higher quality lead generation</strong>
									</p>
									<p>
										<strong>Brand awareness</strong> and engagement
									</p>
									<p>
										<strong>Competitive differentiation</strong>
									</p>
									<p>
										<strong>Measurable ROI</strong> through analytics
									</p>
									<p>
										<strong>Cost-effective alternative</strong> to expensive
										booth activities
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>
											How does QuizBooth help with lead qualification?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										Our platform provides <strong>engagement metrics</strong>{' '}
										that help qualify leads:
									</p>
									<ul>
										<li>See which attendees completed the game</li>
										<li>Track their scores and time spent</li>
										<li>Measure engagement level</li>
									</ul>
									<p>
										This data helps your sales team{' '}
										<strong>prioritize follow-ups</strong> with the most engaged
										prospects.
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>
											Can I measure the ROI of using QuizBooth at my events?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										<strong>Yes!</strong> QuizBooth provides comprehensive
										analytics including:
									</p>
									<ul>
										<li>Number of plays</li>
										<li>Completion rates</li>
										<li>Average scores</li>
										<li>Time spent per game</li>
										<li>Lead conversion metrics</li>
									</ul>
									<p>
										You can track engagement patterns and measure the{' '}
										<strong>direct impact</strong> on your trade show success.
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>
											How does QuizBooth compare to hiring event staff or
											expensive activations?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>QuizBooth provides:</p>
									<p>
										<strong>24/7 engagement</strong> at a fraction of the cost
									</p>
									<p>
										<strong>Works continuously</strong> throughout the event
									</p>
									<p>
										<strong>Engages multiple attendees</strong> simultaneously
									</p>
									<p>
										<strong>Requires minimal supervision</strong>
									</p>
									<p>
										<strong>Delivers consistent results</strong>
									</p>
									<p>
										Compared to additional staff or complex activations,
										QuizBooth is more cost-effective and scalable.
									</p>
								</div>
							</div>
						</details>
					</div>
				</div>
				<div>
					<div>
						<h2>Technical & Setup Questions</h2>
					</div>
					<div>
						<details>
							<summary>
								<div>
									<div>
										<span>
											What technology do I need to use QuizBooth at my trade
											show?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										<strong>Minimal requirements:</strong>
									</p>
									<ul>
										<li>Smartphone or tablet with internet access</li>
										<li>Attendees can use their own devices via QR codes</li>
										<li>Option to set up a dedicated device at your booth</li>
									</ul>
									<p>
										<strong>No special hardware</strong> or complex setup
										required
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>
											How reliable is the platform during busy trade show hours?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										QuizBooth is built on{' '}
										<strong>enterprise-grade infrastructure</strong> with:
									</p>
									<ul>
										<li>
											<strong>Automatic scaling</strong> to handle peak traffic
										</li>
										<li>
											<strong>Firebase</strong> with real-time databases
										</li>
										<li>
											<strong>Global CDN distribution</strong>
										</li>
									</ul>
									<p>
										This ensures <strong>fast, reliable performance</strong>{' '}
										even during the busiest event hours.
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>Can attendees play without downloading an app?</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										<strong>Yes!</strong> QuizBooth is{' '}
										<strong>completely web-based</strong> and works in any
										modern browser.
									</p>
									<p>Attendees simply:</p>
									<ul>
										<li>
											Scan a QR code <strong>OR</strong>
										</li>
										<li>Click a link</li>
									</ul>
									<p>
										<strong>No app downloads</strong> or installations required
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>
											How do I share my trivia game with event attendees?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										We provide <strong>multiple sharing options</strong>:
									</p>
									<ol>
										<li>
											<strong>Dynamic QR codes</strong> for easy scanning
										</li>
										<li>
											<strong>Short URLs</strong> for verbal sharing
										</li>
										<li>
											<strong>Embed codes</strong> for your website
										</li>
										<li>
											<strong>Social media sharing</strong> links
										</li>
									</ol>
									<p>
										Most vendors use{' '}
										<strong>QR codes displayed at their booth</strong> for
										maximum convenience.
									</p>
								</div>
							</div>
						</details>
					</div>
				</div>
				<div>
					<div>
						<h2>Content & Customization</h2>
					</div>
					<div>
						<details>
							<summary>
								<div>
									<div>
										<span>
											How does the AI generate relevant questions for my
											business?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>Our AI analyzes:</p>
									<ul>
										<li>
											<strong>Company information</strong>
										</li>
										<li>
											<strong>Industry</strong>
										</li>
										<li>
											<strong>Product details</strong>
										</li>
									</ul>
									<p>
										It uses{' '}
										<strong>advanced natural language processing</strong> to
										understand your business and generate:
									</p>
									<ul>
										<li>
											<strong>Engaging</strong> trivia content
										</li>
										<li>
											<strong>Accurate</strong> information
										</li>
										<li>
											<strong>Expertise-showcasing</strong> questions
										</li>
									</ul>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>Can I edit or add my own custom questions?</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										<strong>Yes!</strong> While our AI generates great starting
										content, you have <strong>full control</strong> to:
									</p>
									<ul>
										<li>
											<strong>Edit</strong> any question
										</li>
										<li>
											<strong>Add</strong> custom questions
										</li>
										<li>
											<strong>Modify</strong> answers
										</li>
									</ul>
									<p>
										This ensures the trivia <strong>perfectly aligns</strong>{' '}
										with your messaging and brand voice.
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>
											What types of questions work best for trade show
											audiences?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										We recommend a <strong>mix of question types</strong>:
									</p>
									<p>
										<strong>Company-specific</strong> - Highlighting your
										expertise
									</p>
									<p>
										<strong>Industry knowledge</strong> - Engaging professionals
									</p>
									<p>
										<strong>Fun facts</strong> - Keeping it entertaining
									</p>
									<p>
										The ideal balance depends on your audience and goals, which
										our platform helps you achieve.
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>
											How many questions should I include in my trivia game?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										For trade show environments, we recommend{' '}
										<strong>5-10 questions</strong>.
									</p>
									<p>This provides:</p>
									<ul>
										<li>
											<strong>Enough engagement</strong> without overwhelming
											attendees
										</li>
										<li>
											<strong>Higher completion rates</strong>
										</li>
										<li>
											<strong>Better lead capture</strong> results
										</li>
									</ul>
									<p>
										Shorter games work best for attendees moving between booths.
									</p>
								</div>
							</div>
						</details>
					</div>
				</div>
				<div>
					<div>
						<h2>Analytics & Results</h2>
					</div>
					<div>
						<details>
							<summary>
								<div>
									<div>
										<span>What kind of analytics does QuizBooth provide?</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										We provide <strong>comprehensive analytics</strong>{' '}
										including:
									</p>
									<ul>
										<li>
											<strong>Total plays</strong> and completion rates
										</li>
										<li>
											<strong>Average scores</strong> and time spent
										</li>
										<li>
											<strong>Engagement patterns</strong> and lead capture data
										</li>
										<li>
											<strong>Performance comparisons</strong>
										</li>
									</ul>
									<p>
										You can track <strong>real-time engagement</strong> during
										events and access detailed reports afterward.
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>
											How do I access the leads captured through the trivia
											games?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										All captured leads are <strong>securely stored</strong> in
										your dashboard with:
									</p>
									<ul>
										<li>
											<strong>Export options</strong> for contact information
										</li>
										<li>
											<strong>Engagement scores</strong> and timestamps
										</li>
										<li>
											<strong>Easy integration</strong> with your CRM or sales
											processes
										</li>
									</ul>
									<p>Download everything you need for follow-ups.</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>Can I see which questions were most engaging?</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										<strong>Yes!</strong> Our analytics show{' '}
										<strong>question-level performance</strong> including:
									</p>
									<ul>
										<li>
											<strong>Correct/incorrect rates</strong>
										</li>
										<li>
											<strong>Time spent</strong> per question
										</li>
										<li>
											<strong>Engagement metrics</strong>
										</li>
									</ul>
									<p>
										This helps you understand{' '}
										<strong>what content resonates best</strong> with your
										audience.
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>
											How does the leaderboard feature benefit vendors?
										</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										The leaderboard creates{' '}
										<strong>friendly competition</strong> that:
									</p>
									<ul>
										<li>
											<strong>Increases engagement</strong> and repeat plays
										</li>
										<li>
											<strong>Encourages attendees</strong> to return and
											improve scores
										</li>
										<li>
											<strong>Provides multiple touchpoints</strong> for
											conversations
										</li>
										<li>
											<strong>Increases likelihood</strong> of meaningful booth
											interactions
										</li>
									</ul>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>How are scores calculated in QuizBooth?</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										QuizBooth rewards both accuracy and speed with a simple
										scoring system:
									</p>
									<p>
										<strong>Base Points:</strong> 100 points for each correct
										answer
									</p>
									<p>
										<strong>Time Bonus:</strong> Up to 60 bonus points for
										answering quickly (2 points per second saved)
									</p>
									<p>
										<strong>Streak Bonus:</strong> 10 extra points for each
										consecutive correct answer
									</p>
									<p>
										<strong>Example:</strong> If you answer correctly in 10
										seconds with a 3-question streak:
									</p>
									<ul>
										<li>Base: 100 points</li>
										<li>Time Bonus: 40 points (20 seconds saved × 2)</li>
										<li>Streak Bonus: 30 points (3 × 10)</li>
										<li>
											<strong>Total:</strong> 170 points for that question
										</li>
									</ul>
									<p>
										This system creates fair competition while encouraging both
										knowledge and quick thinking.
									</p>
								</div>
							</div>
						</details>
					</div>
				</div>
				<div>
					<div>
						<h2>Pricing & Support</h2>
					</div>
					<div>
						<details>
							<summary>
								<div>
									<div>
										<span>Is there a free trial available?</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										<strong>Yes!</strong> We offer a <strong>free trial</strong>{' '}
										that allows you to:
									</p>
									<ul>
										<li>
											<strong>Create and test games</strong> with full
											functionality
										</li>
										<li>
											<strong>Experience the platform</strong> firsthand
										</li>
										<li>
											<strong>See engagement results</strong> before committing
										</li>
									</ul>
									<p>No credit card required to get started.</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>What support is available during my trade show?</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										We provide <strong>dedicated support</strong> during event
										hours including:
									</p>
									<ul>
										<li>
											<strong>Technical assistance</strong> for any issues
										</li>
										<li>
											<strong>Content guidance</strong> and optimization
										</li>
										<li>
											<strong>Rapid response</strong> to questions
										</li>
									</ul>
									<p>
										Everything runs smoothly with our support team available.
									</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>Can I use QuizBooth for multiple events?</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										<strong>Absolutely!</strong> Your account supports:
									</p>
									<ul>
										<li>
											<strong>Unlimited games</strong> across multiple events
										</li>
										<li>
											<strong>Reuse successful templates</strong>
										</li>
										<li>
											<strong>Create new games</strong> for different shows
										</li>
										<li>
											<strong>Target different audiences</strong> and campaigns
										</li>
									</ul>
									<p>One account, endless possibilities.</p>
								</div>
							</div>
						</details>
						<details>
							<summary>
								<div>
									<div>
										<span>How does pricing work for enterprise clients?</span>
									</div>
								</div>
							</summary>
							<div>
								<div>
									<p>
										We offer <strong>flexible enterprise pricing</strong>{' '}
										including:
									</p>
									<ul>
										<li>
											<strong>Volume discounts</strong> for larger organizations
										</li>
										<li>
											<strong>White-label options</strong> for branding
										</li>
										<li>
											<strong>Custom integrations</strong> with your systems
										</li>
										<li>
											<strong>Dedicated account management</strong>
										</li>
									</ul>
									<p>Contact us for a customized quote.</p>
								</div>
							</div>
						</details>
					</div>
				</div>
			</div>
		</section>
	</div>
)

// SSR-safe Quiz Games page
const QuizGamesPageSSR = () => (
	<div>
		<h1>Public Quiz Games</h1>
		<p>
			Browse the curated collection of community-created trivia games. Filter by
			industry and categories to find your perfect challenge.
		</p>

		<div>
			<p>
				Discover fresh trivia challenges every day! Play our curated selection
				of AI-powered trivia games covering business, technology, and industry
				topics.
			</p>
			<p>
				Games are loaded dynamically on the client side for the best experience.
			</p>
		</div>
	</div>
)

/**
 * Render a marketing page to HTML string
 */
export function renderMarketingPage(url: string): {
	html: string
	head: string
} {
	let PageComponent: React.ComponentType | null = null

	// Determine which page to render based on URL
	switch (url) {
		case '/':
			PageComponent = HomePageSSR
			break
		case '/about':
			PageComponent = AboutPageSSR
			break
		case '/faq':
			PageComponent = FAQPageSSR
			break
		case '/pricing':
			PageComponent = PricingPageSSR
			break
		case '/quiz-games':
			PageComponent = QuizGamesPageSSR
			break
		default:
			return { html: '', head: '' }
	}

	if (!PageComponent) {
		return { html: '', head: '' }
	}

	// Render the page without Helmet for now
	const html = renderToString(<PageComponent />)

	// Return empty head for now - meta tags are in the template
	const head = ''

	return { html, head }
}
