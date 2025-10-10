import { renderToString } from 'react-dom/server';
import React from 'react';
import { isDynamicRoute } from './config/dynamic-routes';

// Server-side components that match the actual React app structure
const HomePage = () => (
  React.createElement('div', { className: 'flex-1 flex flex-col' },
    // Hero Section
    React.createElement('section', { className: 'relative mt-4 md:pt-0 px-4 md:px-8' },
      React.createElement('div', { className: 'max-w-5xl mx-auto' },
        React.createElement('div', { className: 'text-center relative z-10' },
          React.createElement('div', { className: 'mb-8 animate-slide-up' },
            React.createElement('h1', { className: 'text-h1 text-foreground my-8' },
              'Create ',
              React.createElement('span', { className: 'text-primary font-bold' }, 'Trivia Games'),
              React.createElement('br'),
              'for your business'
            ),
            React.createElement('p', { className: 'text-xl text-foreground max-w-3xl mx-auto mb-12 leading-relaxed' },
              'Engage your customers through play. Generate AI-powered custom trivia questions for your trade show booth and capture leads while visitors have fun competing for prizes.'
            )
          ),
          React.createElement('div', {
            className: 'flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up',
            style: { animationDelay: '0.2s' }
          },
            React.createElement('a', { href: '/setup' },
              React.createElement('button', {
                className: 'px-8 py-3 w-full text-lg sm:w-auto bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors'
              },
                'Create Your Game'
              )
            )
          )
        )
      )
    ),

    // Value Proposition Section
    React.createElement('section', { className: 'relative pt-4 lg:pt-0 px-4 sm:px-6 lg:px-8 my-4' },
      React.createElement('div', { className: 'max-w-5xl mx-auto' },
        React.createElement('div', { className: 'text-center mb-4 md:mb-16' },
          React.createElement('h2', { className: 'text-2xl md:text-3xl font-bold text-foreground my-4 md:my-8' },
            'Why Choose QuizBooth?'
          )
        ),
        React.createElement('ul', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          [
            {
              title: 'AI-Powered Questions',
              description: 'Never run out of engaging content. Our AI generates unique questions in seconds.'
            },
            {
              title: 'Lead Capture',
              description: 'Turn players into leads. Seamlessly collect contact information at your event.'
            },
            {
              title: 'Easy Sharing',
              description: 'Go live in seconds. Share your game via QR code or a simple link.'
            }
          ].map((feature, index) =>
            React.createElement('li', {
              key: feature.title,
              className: 'text-center animate-slide-up',
              style: { animationDelay: `${0.1 * index}s` }
            },
              React.createElement('div', { className: 'flex justify-center mb-4' },
                React.createElement('div', { className: 'p-2 md:p-3 bg-primary/10 rounded-full border-2 border-primary' },
                  React.createElement('div', { className: 'h-4 w-4 md:h-8 md:w-8 text-primary' })
                )
              ),
              React.createElement('h3', { className: 'text-xl font-semibold text-foreground mb-3' },
                feature.title
              ),
              React.createElement('p', { className: 'text-primary leading-relaxed' },
                feature.description
              )
            )
          )
        )
      )
    ),

    // Recent Games Section
    React.createElement('section', { className: 'relative pt-4 lg:pt-0 px-4 sm:px-6 lg:px-8 my-12' },
      React.createElement('div', { className: 'max-w-7xl mx-auto' },
        React.createElement('div', { className: 'text-center mb-8' },
          React.createElement('h2', { className: 'text-2xl md:text-3xl font-bold text-foreground mb-4' },
            'Recently Added Games'
          ),
          React.createElement('p', { className: 'text-lg text-foreground max-w-2xl mx-auto' },
            'Check out the latest trivia games created by our community. Play, learn, and have fun!'
          )
        ),
        React.createElement('div', { className: 'text-center py-12' },
          React.createElement('div', { className: 'max-w-md mx-auto bg-card border rounded-lg p-6' },
            React.createElement('div', { className: 'h-12 w-12 text-muted-foreground mx-auto mb-4' }),
            React.createElement('h3', { className: 'text-lg font-semibold text-foreground mb-2' },
              'No Public Games Yet'
            ),
            React.createElement('p', { className: 'text-muted-foreground mb-4' },
              'Be the first to create a public trivia game!'
            ),
            React.createElement('a', { href: '/setup' },
              React.createElement('button', {
                className: 'bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors'
              },
                'Create Your Game'
              )
            )
          )
        )
      )
    )
  )
);

const AboutPage = () => (
  React.createElement('div', { className: 'flex-1 flex flex-col' },
    // Hero Section
    React.createElement('section', { className: 'relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10' },
      React.createElement('div', { className: 'max-w-6xl mx-auto text-center' },
        React.createElement('div', { className: 'mb-8' },
          React.createElement('h1', { className: 'text-4xl md:text-5xl font-bold text-foreground mb-6' },
            'About ',
            React.createElement('span', { className: 'text-primary' }, 'QuizBooth')
          ),
          React.createElement('p', { className: 'text-xl text-foreground max-w-3xl mx-auto leading-relaxed' },
            'QuizBooth is a comprehensive platform designed specifically for trade shows and events, combining AI-powered content generation with robust engagement tools to help businesses connect with their audience through interactive trivia experiences.'
          )
        )
      )
    ),

    // Version Information
    React.createElement('section', { className: 'py-12 px-4 sm:px-6 lg:px-8' },
      React.createElement('div', { className: 'max-w-6xl mx-auto' },
        React.createElement('div', { className: 'text-center mb-12' },
          React.createElement('h2', { className: 'text-3xl font-bold text-foreground mb-4' },
            'Version Information'
          ),
          React.createElement('div', { className: 'flex flex-col sm:flex-row justify-center items-center gap-4 mb-8' },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: 'text-lg font-semibold' },
                'Current Version: 1.0.0-beta.1'
              )
            ),
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: 'text-lg' }, 'Last Updated: October 2025')
            )
          )
        )
      )
    ),

    // Features Overview
    React.createElement('section', { className: 'py-12 px-4 sm:px-6 lg:px-8 bg-muted/30' },
      React.createElement('div', { className: 'max-w-6xl mx-auto' },
        React.createElement('div', { className: 'text-center mb-12' },
          React.createElement('h2', { className: 'text-3xl font-bold text-foreground mb-4' },
            'Comprehensive Feature Set'
          ),
          React.createElement('p', { className: 'text-lg text-foreground max-w-2xl mx-auto' },
            'QuizBooth offers a complete suite of tools designed specifically for trade show engagement and lead generation through interactive trivia experiences.'
          )
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
          [
            {
              title: 'AI-Powered Question Generation',
              features: [
                'DeepSeek AI Integration for intelligent question generation',
                'Category-specific prompts',
                'Website-based company detection',
                'Batch question generation',
              ]
            },
            {
              title: 'Game Creation & Management',
              features: [
                'Multi-step game creation wizard',
                'Flexible prize system with multiple tiers',
                'AI-generated game titles',
                'User dashboard for game management',
              ]
            },
            {
              title: 'Player Experience & Engagement',
              features: [
                'Immersive gameplay interface',
                'Multiple choice questions with randomized answers',
                'Real-time scoring and progress tracking',
                'Mobile-optimized responsive design',
              ]
            },
            {
              title: 'Leaderboard & Analytics',
              features: [
                'Real-time game-specific leaderboards',
                'Global cross-game rankings',
                'Intelligent caching system',
                'Player submissions and engagement tracking',
              ]
            },
            {
              title: 'Sharing & Distribution',
              features: [
                'Dynamic QR code generation',
                'Shareable embed codes for websites',
                'Public URLs for direct game access',
                'Event-ready distribution system',
              ]
            },
            {
              title: 'Technical Architecture',
              features: [
                'Full-stack TypeScript with React 18',
                'Firebase Firestore real-time database',
                'Performance-optimized caching system',
                'Intelligent code splitting and lazy loading',
              ]
            }
          ].map((category, index) =>
            React.createElement('div', {
              key: category.title,
              className: 'bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow duration-300'
            },
              React.createElement('h3', { className: 'text-lg font-semibold text-foreground mb-4' },
                category.title
              ),
              React.createElement('ul', { className: 'space-y-2' },
                category.features.map((feature, featureIndex) =>
                  React.createElement('li', {
                    key: featureIndex,
                    className: 'flex items-start gap-2 text-sm'
                  },
                    React.createElement('span', { className: 'text-primary' }, '•'),
                    React.createElement('span', { className: 'text-foreground' }, feature)
                  )
                )
              )
            )
          )
        )
      )
    ),

    // Call to Action
    React.createElement('section', { className: 'py-12 px-4 sm:px-6 lg:px-8 bg-primary/5' },
      React.createElement('div', { className: 'max-w-4xl mx-auto text-center' },
        React.createElement('h2', { className: 'text-3xl font-bold text-foreground mb-6' },
          'Ready to Create Your First Game?'
        ),
        React.createElement('p', { className: 'text-lg text-foreground mb-8 max-w-2xl mx-auto' },
          "Start exploring QuizBooth's features and create engaging trivia experiences for your events. As a new platform, we're excited to help you connect with your audience through interactive gameplay."
        )
      )
    )
  )
);

const QuizGamesPage = ({ publicGames = [] }: { publicGames?: any[] }) => (
  React.createElement('div', { className: 'min-h-screen bg-background' },
    React.createElement('div', { className: 'container mx-auto px-4 py-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Public Quiz Games'),
      React.createElement('p', { className: 'text-center text-muted-foreground mb-8' },
        'Browse and play trivia games created by the QuizBooth community'
      ),
      publicGames && publicGames.length > 0 ? (
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
          publicGames.slice(0, 6).map((game: any) =>
            React.createElement('div', { key: game.id, className: 'bg-card border rounded-lg p-6' },
              React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, game.title || 'Untitled Game'),
              React.createElement('p', { className: 'text-muted-foreground mb-4' }, game.description || 'No description available'),
              React.createElement('a', {
                href: `/game/${game.id}`,
                className: 'bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors'
              }, 'Play Game')
            )
          )
        )
      ) : (
        React.createElement('div', { className: 'text-center text-muted-foreground' },
          React.createElement('p', null, 'No public games available at the moment.'),
          React.createElement('p', { className: 'mt-2' },
            React.createElement('a', { href: '/setup', className: 'text-primary hover:underline' }, 'Create the first public game')
          )
        )
      )
    )
  )
);

const FAQPage = () => (
  React.createElement('div', { className: 'flex-1 flex flex-col' },
    // Hero Section
    React.createElement('section', { className: 'relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10' },
      React.createElement('div', { className: 'max-w-6xl mx-auto text-center' },
        React.createElement('div', { className: 'mb-8' },
          React.createElement('h1', { className: 'text-4xl md:text-5xl font-bold text-foreground mb-6' },
            'Frequently Asked Questions'
          ),
          React.createElement('p', { className: 'text-xl text-foreground max-w-3xl mx-auto leading-relaxed' },
            'Everything you need to know about using QuizBooth for trade shows and events. Learn how to engage attendees, capture leads, and maximize your event ROI.'
          )
        )
      )
    ),

    // Vendor Benefits Section
    React.createElement('section', { className: 'py-12 px-4 sm:px-6 lg:px-8' },
      React.createElement('div', { className: 'max-w-6xl mx-auto' },
        React.createElement('div', { className: 'text-center mb-12' },
          React.createElement('h2', { className: 'text-3xl font-bold text-foreground mb-4' },
            'Key Benefits for Trade Show Vendors'
          ),
          React.createElement('p', { className: 'text-lg text-foreground max-w-2xl mx-auto' },
            'Discover how QuizBooth transforms your trade show presence with measurable results and enhanced engagement.'
          )
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
          [
            {
              title: 'Increased Booth Traffic',
              description: 'Attract more visitors with engaging trivia that stands out from traditional booth activities'
            },
            {
              title: 'Qualified Lead Generation',
              description: 'Capture contact information from genuinely interested prospects through voluntary participation'
            },
            {
              title: 'Brand Differentiation',
              description: 'Stand out from competitors with innovative, tech-forward engagement that positions your brand as modern and customer-focused'
            },
            {
              title: 'Extended Dwell Time',
              description: 'Keep attendees at your booth longer with compelling content that encourages exploration and conversation'
            },
            {
              title: 'Easy Distribution',
              description: 'Quick setup with QR codes and shareable links that work instantly without complex installations'
            },
            {
              title: 'Event Analytics',
              description: 'Measure engagement, track performance, and demonstrate ROI with comprehensive event-specific analytics'
            }
          ].map((benefit, index) =>
            React.createElement('div', {
              key: benefit.title,
              className: 'bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300'
            },
              React.createElement('div', { className: 'flex justify-center mb-4' },
                React.createElement('div', { className: 'p-3 bg-primary/10 rounded-full border-2 border-primary' },
                  React.createElement('div', { className: 'h-6 w-6 text-primary' })
                )
              ),
              React.createElement('h3', { className: 'text-lg font-semibold mb-3' }, benefit.title),
              React.createElement('p', { className: 'text-foreground text-sm' }, benefit.description)
            )
          )
        )
      )
    ),

    // FAQ Sections
    React.createElement('section', { className: 'py-12 px-4 sm:px-6 lg:px-8 bg-muted/30' },
      React.createElement('div', { className: 'max-w-6xl mx-auto' },
        React.createElement('div', { className: 'space-y-12' },
          // Trade Show & Event Focus
          React.createElement('div', null,
            React.createElement('div', { className: 'flex items-center gap-3 mb-6' },
              React.createElement('div', { className: 'h-6 w-6 text-primary' }),
              React.createElement('h2', { className: 'text-2xl font-bold text-foreground' },
                'Trade Show & Event Focus'
              )
            ),
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', { className: 'border rounded-lg px-4 bg-background' },
                React.createElement('div', { className: 'py-4' },
                  React.createElement('div', { className: 'flex items-start gap-3' },
                    React.createElement('div', { className: 'h-5 w-5 text-primary mt-0.5 flex-shrink-0' }),
                    React.createElement('span', { className: 'font-semibold text-foreground' },
                      'How can QuizBooth specifically help vendors at trade shows?'
                    )
                  )
                ),
                React.createElement('div', { className: 'pb-4' },
                  React.createElement('div', { className: 'flex items-start gap-3 pl-8' },
                    React.createElement('div', { className: 'h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' }),
                    React.createElement('div', { className: 'text-primary leading-relaxed' },
                      'QuizBooth is designed specifically for trade show environments to help vendors stand out from competitors with engaging trivia, engage attendees with interactive content, and capture qualified leads through voluntary participation.'
                    )
                  )
                )
              ),
              React.createElement('div', { className: 'border rounded-lg px-4 bg-background' },
                React.createElement('div', { className: 'py-4' },
                  React.createElement('div', { className: 'flex items-start gap-3' },
                    React.createElement('div', { className: 'h-5 w-5 text-primary mt-0.5 flex-shrink-0' }),
                    React.createElement('span', { className: 'font-semibold text-foreground' },
                      'How quickly can I set up a game for my trade show booth?'
                    )
                  )
                ),
                React.createElement('div', { className: 'pb-4' },
                  React.createElement('div', { className: 'flex items-start gap-3 pl-8' },
                    React.createElement('div', { className: 'h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' }),
                    React.createElement('div', { className: 'text-primary leading-relaxed' },
                      'Most vendors can create and deploy a fully customized trivia game in under 2 minutes using our AI-powered question generation.'
                    )
                  )
                )
              )
            )
          ),

          // Vendor Benefits & ROI
          React.createElement('div', null,
            React.createElement('div', { className: 'flex items-center gap-3 mb-6' },
              React.createElement('div', { className: 'h-6 w-6 text-primary' }),
              React.createElement('h2', { className: 'text-2xl font-bold text-foreground' },
                'Vendor Benefits & ROI'
              )
            ),
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', { className: 'border rounded-lg px-4 bg-background' },
                React.createElement('div', { className: 'py-4' },
                  React.createElement('div', { className: 'flex items-start gap-3' },
                    React.createElement('div', { className: 'h-5 w-5 text-primary mt-0.5 flex-shrink-0' }),
                    React.createElement('span', { className: 'font-semibold text-foreground' },
                      'What are the key benefits for trade show vendors?'
                    )
                  )
                ),
                React.createElement('div', { className: 'pb-4' },
                  React.createElement('div', { className: 'flex items-start gap-3 pl-8' },
                    React.createElement('div', { className: 'h-4 w-4 text-green-500 mt-0.5 flex-shrink-0' }),
                    React.createElement('div', { className: 'text-primary leading-relaxed' },
                      'Vendors benefit from increased booth traffic, higher quality lead generation, brand awareness, competitive differentiation, measurable ROI, and cost-effective alternatives to expensive booth activities.'
                    )
                  )
                )
              )
            )
          )
        )
      )
    ),

    // Call to Action
    React.createElement('section', { className: 'py-12 px-4 sm:px-6 lg:px-8' },
      React.createElement('div', { className: 'max-w-4xl mx-auto text-center' },
        React.createElement('div', { className: 'bg-primary/5 rounded-2xl p-8' },
          React.createElement('h2', { className: 'text-3xl font-bold text-foreground mb-4' },
            'Ready to Transform Your Trade Show Experience?'
          ),
          React.createElement('p', { className: 'text-lg text-foreground mb-6 max-w-2xl mx-auto' },
            'Join hundreds of vendors who are using QuizBooth to stand out, engage attendees, and capture qualified leads at their events.'
          )
        )
      )
    )
  )
);

const PricingPage = () => (
  React.createElement('div', { className: 'min-h-screen bg-background' },
    React.createElement('div', { className: 'container mx-auto px-4 py-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Pricing Plans'),
      React.createElement('p', { className: 'text-center text-muted-foreground mb-8' },
        'Choose the plan that works best for your business needs'
      ),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto' },
        // Free Plan
        React.createElement('div', { className: 'bg-card border rounded-lg p-6' },
          React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'Free'),
          React.createElement('div', { className: 'text-2xl font-bold mb-4' }, '$0/month'),
          React.createElement('ul', { className: 'space-y-2 text-muted-foreground' },
            React.createElement('li', null, '✓ Basic game creation'),
            React.createElement('li', null, '✓ AI question generation'),
            React.createElement('li', null, '✓ QR code sharing'),
            React.createElement('li', null, '✓ Basic analytics')
          )
        ),
        // Pro Plan
        React.createElement('div', { className: 'bg-card border rounded-lg p-6 border-primary' },
          React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'Pro'),
          React.createElement('div', { className: 'text-2xl font-bold mb-4' }, '$29/month'),
          React.createElement('ul', { className: 'space-y-2 text-muted-foreground' },
            React.createElement('li', null, '✓ Everything in Free'),
            React.createElement('li', null, '✓ Advanced customization'),
            React.createElement('li', null, '✓ Priority support'),
            React.createElement('li', null, '✓ Export analytics')
          )
        ),
        // Enterprise Plan
        React.createElement('div', { className: 'bg-card border rounded-lg p-6' },
          React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'Enterprise'),
          React.createElement('div', { className: 'text-2xl font-bold mb-4' }, 'Custom'),
          React.createElement('ul', { className: 'space-y-2 text-muted-foreground' },
            React.createElement('li', null, '✓ Everything in Pro'),
            React.createElement('li', null, '✓ White-label solutions'),
            React.createElement('li', null, '✓ API access'),
            React.createElement('li', null, '✓ Dedicated account manager')
          )
        )
      )
    )
  )
);

const ContactPage = () => (
  React.createElement('div', { className: 'min-h-screen bg-background' },
    React.createElement('div', { className: 'flex-1 flex flex-col' },
      // Hero Section
      React.createElement('section', { className: 'relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10' },
        React.createElement('div', { className: 'max-w-4xl mx-auto text-center' },
          React.createElement('div', { className: 'mb-8' },
            React.createElement('h1', { className: 'text-4xl md:text-5xl font-bold text-foreground mb-6' },
              'Contact ',
              React.createElement('span', { className: 'text-primary' }, 'QuizBooth')
            ),
            React.createElement('p', { className: 'text-xl text-foreground max-w-2xl mx-auto leading-relaxed' },
              "Have questions, feedback, or need support? We'd love to hear from you. Get in touch with our team and we'll get back to you as soon as possible."
            )
          )
        )
      ),
      // Contact Form Section
      React.createElement('section', { className: 'py-12 px-2 lg:px-8' },
        React.createElement('div', { className: 'max-w-2xl mx-auto' },
          React.createElement('div', { className: 'bg-card border rounded-lg p-6 shadow-sm' },
            React.createElement('div', { className: 'text-center mb-6' },
              React.createElement('h2', { className: 'text-2xl font-bold flex items-center justify-center gap-2' },
                React.createElement('span', { className: 'text-primary' }, '✉️'),
                'Send us a Message'
              ),
              React.createElement('p', { className: 'text-muted-foreground mt-2' },
                "Fill out the form below and we'll respond within 24 hours"
              )
            ),
            React.createElement('div', { className: 'space-y-4' },
              // Name Field
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Full Name'),
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'Enter your full name',
                  className: 'w-full px-3 py-2 border rounded-md bg-background'
                })
              ),
              // Email Field
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Email Address'),
                React.createElement('input', {
                  type: 'email',
                  placeholder: 'your.email@example.com',
                  className: 'w-full px-3 py-2 border rounded-md bg-background'
                })
              ),
              // Message Field
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Message'),
                React.createElement('textarea', {
                  placeholder: 'Tell us how we can help you...',
                  rows: 6,
                  className: 'w-full px-3 py-2 border rounded-md bg-background'
                })
              ),
              // Submit Button
              React.createElement('button', {
                className: 'w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors'
              }, 'Send Message')
            )
          ),
          // Additional Contact Information
          React.createElement('div', { className: 'mt-12 grid grid-cols-1 md:grid-cols-2 gap-6' },
            React.createElement('div', { className: 'bg-card border rounded-lg p-6' },
              React.createElement('h3', { className: 'text-xl font-semibold mb-4 flex items-center gap-2' },
                React.createElement('span', { className: 'text-primary' }, '📧'),
                'Email Support'
              ),
              React.createElement('p', { className: 'text-foreground mb-2' },
                'For direct support, you can also email us at:'
              ),
              React.createElement('a', {
                href: 'mailto:contact@quizbooth.games',
                className: 'text-primary hover:underline font-medium'
              }, 'contact@quizbooth.games')
            ),
            React.createElement('div', { className: 'bg-card border rounded-lg p-6' },
              React.createElement('h3', { className: 'text-xl font-semibold mb-4 flex items-center gap-2' },
                React.createElement('span', { className: 'text-primary' }, '⏱️'),
                'Response Time'
              ),
              React.createElement('p', { className: 'text-foreground' },
                'We typically respond to all inquiries within 24 hours during business days. For urgent matters, please indicate in your message.'
              )
            )
          )
        )
      )
    )
  )
);

const SignInPage = () => (
  React.createElement('div', { className: 'min-h-screen bg-background' },
    React.createElement('div', { className: 'container mx-auto px-4 py-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Sign In to QuizBooth'),
      React.createElement('p', { className: 'text-center text-muted-foreground mb-8' },
        'Access your account to create and manage trivia games'
      ),
      React.createElement('div', { className: 'max-w-md mx-auto bg-card border rounded-lg p-6' },
        React.createElement('p', { className: 'text-center text-muted-foreground' },
          'Sign in to access your dashboard and create engaging trivia games.'
        )
      )
    )
  )
);

const SetupPage = () => (
  React.createElement('div', { className: 'min-h-screen bg-background' },
    React.createElement('div', { className: 'container mx-auto px-4 py-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Create Your Trivia Game'),
      React.createElement('p', { className: 'text-center text-muted-foreground mb-8' },
        'Set up your custom trivia game with AI-powered questions and engaging gameplay'
      ),
      React.createElement('div', { className: 'max-w-md mx-auto bg-card border rounded-lg p-6' },
        React.createElement('p', { className: 'text-center text-muted-foreground' },
          'Create your first trivia game with our easy setup wizard. Customize questions, prizes, and game settings.'
        )
      )
    )
  )
);

const NotFoundPage = () => (
  React.createElement('div', { className: 'min-h-screen bg-background flex items-center justify-center' },
    React.createElement('div', { className: 'text-center' },
      React.createElement('h1', { className: 'text-4xl font-bold mb-4' }, 'Page Not Found'),
      React.createElement('p', { className: 'text-muted-foreground mb-8' },
        `The page you're looking for doesn't exist.`
      ),
      React.createElement('a', {
        href: '/',
        className: 'bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors'
      }, 'Go Home')
    )
  )
);

export async function renderPage(path: string, pageData: any) {
  let Component;
  let metaTags = '';

  // Check if this is a dynamic route that should be handled by client-side routing
  if (isDynamicRoute(path)) {
    // For dynamic routes, serve a generic page that will be hydrated by client-side React
    // Return empty string since the template already provides the root div
    Component = () => React.createElement(React.Fragment);
    metaTags = `
      <title>QuizBooth - Interactive Trivia Games</title>
      <meta name="description" content="Play engaging trivia games created with QuizBooth. Interactive gameplay with AI-powered questions and real-time scoring.">
      <meta property="og:title" content="QuizBooth - Interactive Trivia Games">
      <meta property="og:description" content="Play engaging trivia games created with QuizBooth">
      <meta property="og:type" content="website">
      <meta property="og:url" content="https://quizbooth.games${path}">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="QuizBooth - Interactive Trivia Games">
      <meta name="twitter:description" content="Play engaging trivia games created with QuizBooth">
    `;
  } else {
    switch (path) {
      case '/':
        Component = HomePage;
        metaTags = `
          <title>QuizBooth - Create Engaging Trivia Games</title>
          <meta name="description" content="Create AI-powered custom trivia games for trade shows and events. Engage customers, capture leads, and drive business growth.">
          <meta property="og:title" content="QuizBooth - Create Engaging Trivia Games">
          <meta property="og:description" content="AI-powered trivia games for trade shows and events">
          <meta property="og:image" content="/assets/quiz-booth-icon.png">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://quizbooth.games">
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="QuizBooth - Create Engaging Trivia Games">
          <meta name="twitter:description" content="AI-powered trivia games for trade shows and events">
        `;
        break;

      case '/quiz-games':
        Component = QuizGamesPage;
        metaTags = `
          <title>Public Quiz Games - QuizBooth</title>
          <meta name="description" content="Browse and play public trivia games created by the QuizBooth community. Discover engaging quizzes on various topics.">
          <meta property="og:title" content="Public Quiz Games - QuizBooth">
          <meta property="og:description" content="Play engaging trivia games created by our community">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://quizbooth.games/quiz-games">
        `;
        break;

      case '/about':
        Component = AboutPage;
        metaTags = `
          <title>About QuizBooth - Our Mission</title>
          <meta name="description" content="Learn about QuizBooth's mission to create engaging trivia experiences for businesses and events. Discover how we help companies grow.">
          <meta property="og:title" content="About QuizBooth - Our Mission">
          <meta property="og:description" content="Learn about QuizBooth's mission to create engaging trivia experiences">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://quizbooth.games/about">
        `;
        break;

      case '/faq':
        Component = FAQPage;
        metaTags = `
          <title>FAQ - QuizBooth Help Center</title>
          <meta name="description" content="Frequently asked questions about creating and playing trivia games with QuizBooth. Get answers about features, pricing, and more.">
          <meta property="og:title" content="FAQ - QuizBooth Help Center">
          <meta property="og:description" content="Frequently asked questions about creating and playing trivia games">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://quizbooth.games/faq">
        `;
        break;

      case '/pricing':
        Component = PricingPage;
        metaTags = `
          <title>Pricing Plans - QuizBooth</title>
          <meta name="description" content="Choose the perfect plan for your business. QuizBooth offers free and premium plans for creating engaging trivia games for events and trade shows.">
          <meta property="og:title" content="Pricing Plans - QuizBooth">
          <meta property="og:description" content="Choose the perfect plan for your business needs">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://quizbooth.games/pricing">
        `;
        break;

      case '/auth/sign-in':
        Component = SignInPage;
        metaTags = `
          <title>Sign In - QuizBooth</title>
          <meta name="description" content="Sign in to your QuizBooth account to create and manage trivia games for your business events and trade shows.">
          <meta property="og:title" content="Sign In - QuizBooth">
          <meta property="og:description" content="Access your account to create engaging trivia games">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://quizbooth.games/auth/sign-in">
        `;
        break;

      case '/auth/complete':
        Component = SignInPage; // Use same component for complete page
        metaTags = `
          <title>Complete Sign In - QuizBooth</title>
          <meta name="description" content="Complete your QuizBooth sign-in process to access your account and create engaging trivia games.">
          <meta property="og:title" content="Complete Sign In - QuizBooth">
          <meta property="og:description" content="Complete your sign-in process">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://quizbooth.games/auth/complete">
        `;
        break;

      case '/setup':
        Component = SetupPage;
        metaTags = `
          <title>Create Trivia Game - QuizBooth</title>
          <meta name="description" content="Set up your custom trivia game with AI-powered questions and engaging gameplay. Create the perfect game for your trade show or event.">
          <meta property="og:title" content="Create Trivia Game - QuizBooth">
          <meta property="og:description" content="Set up your custom trivia game with AI-powered questions">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://quizbooth.games/setup">
        `;
        break;

      case '/contact':
        Component = ContactPage;
        metaTags = `
          <title>Contact Us - QuizBooth</title>
          <meta name="description" content="Get in touch with the QuizBooth team. We're here to help with technical support, partnerships, feature requests, and any questions you may have.">
          <meta property="og:title" content="Contact Us - QuizBooth">
          <meta property="og:description" content="Contact the QuizBooth team for support, partnerships, and inquiries about our AI-powered trivia platform.">
          <meta property="og:type" content="website">
          <meta property="og:url" content="https://quizbooth.games/contact">
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="Contact Us - QuizBooth">
          <meta name="twitter:description" content="Contact the QuizBooth team for support, partnerships, and inquiries about our AI-powered trivia platform.">
        `;
        break;

      default:
        Component = NotFoundPage;
        metaTags = `
          <title>Page Not Found - QuizBooth</title>
          <meta name="description" content="The page you're looking for doesn't exist. Return to QuizBooth home page.">
        `;
    }
  }

  const html = renderToString(React.createElement(Component, pageData));

  return { html, metaTags };
}
