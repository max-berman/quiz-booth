import { renderToString } from 'react-dom/server';
import React from 'react';

// Server-side components (simplified versions for SSR)
const HomePage = () => (
  React.createElement('div', { className: 'min-h-screen bg-background' },
    React.createElement('div', { className: 'container mx-auto px-4 py-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'QuizBooth'),
      React.createElement('p', { className: 'text-xl text-center text-muted-foreground mb-8' },
        'Create AI-powered custom trivia games for trade shows and events'
      ),
      React.createElement('div', { className: 'text-center' },
        React.createElement('a', {
          href: '/setup',
          className: 'bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors'
        }, 'Create Your Game')
      )
    )
  )
);

const AboutPage = () => (
  React.createElement('div', { className: 'min-h-screen bg-background' },
    React.createElement('div', { className: 'container mx-auto px-4 py-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'About QuizBooth'),
      React.createElement('div', { className: 'max-w-2xl mx-auto text-lg text-muted-foreground' },
        React.createElement('p', { className: 'mb-4' },
          'QuizBooth is an AI-powered platform that helps businesses create engaging trivia games for trade shows, events, and marketing campaigns.'
        ),
        React.createElement('p', { className: 'mb-4' },
          'Our mission is to make it easy for companies to capture leads, engage customers, and drive business growth through interactive gameplay.'
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
  React.createElement('div', { className: 'min-h-screen bg-background' },
    React.createElement('div', { className: 'container mx-auto px-4 py-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Frequently Asked Questions'),
      React.createElement('div', { className: 'max-w-3xl mx-auto space-y-6' },
        React.createElement('div', { className: 'bg-card border rounded-lg p-6' },
          React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'What is QuizBooth?'),
          React.createElement('p', { className: 'text-muted-foreground' },
            'QuizBooth is an AI-powered platform that helps businesses create engaging trivia games for trade shows, events, and marketing campaigns.'
          )
        ),
        React.createElement('div', { className: 'bg-card border rounded-lg p-6' },
          React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'How do I create a game?'),
          React.createElement('p', { className: 'text-muted-foreground' },
            'Simply sign up, click "Create Your Game", and our AI will help you generate questions based on your topic and difficulty preferences.'
          )
        ),
        React.createElement('div', { className: 'bg-card border rounded-lg p-6' },
          React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'Is it free to use?'),
          React.createElement('p', { className: 'text-muted-foreground' },
            'QuizBooth offers both free and premium plans. The free plan includes basic features while premium plans unlock advanced customization and analytics.'
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
    React.createElement('div', { className: 'container mx-auto px-4 py-8' },
      React.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Contact QuizBooth'),
      React.createElement('p', { className: 'text-center text-muted-foreground mb-8' },
        'Have questions, feedback, or need support? We\'d love to hear from you.'
      ),
      React.createElement('div', { className: 'max-w-2xl mx-auto bg-card border rounded-lg p-6' },
        React.createElement('p', { className: 'text-muted-foreground mb-4' },
          'Get in touch with our team and we\'ll get back to you as soon as possible.'
        ),
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('strong', null, 'Email Support:'),
            React.createElement('p', { className: 'text-muted-foreground' }, 'contact@quizbooth.games')
          ),
          React.createElement('div', null,
            React.createElement('strong', null, 'Response Time:'),
            React.createElement('p', { className: 'text-muted-foreground' }, 'We typically respond within 24 hours during business days.')
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
  const isDynamicRoute =
    path.startsWith('/game/') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/setup') ||
    path.startsWith('/edit-questions/') ||
    path.startsWith('/game-created') ||
    path.startsWith('/leaderboard/') ||
    path.startsWith('/results/') ||
    path.startsWith('/submissions/');

  if (isDynamicRoute) {
    // For dynamic routes, serve a generic page that will be hydrated by client-side React
    Component = () => React.createElement('div', { id: 'root' });
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
          <meta name="twitter:description" content="Contact the QuizBooth team for support, partnerships, and inquiries">
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
