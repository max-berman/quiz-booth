"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPage = void 0;
const server_1 = require("react-dom/server");
const react_1 = __importDefault(require("react"));
// Server-side components (simplified versions for SSR)
const HomePage = () => (react_1.default.createElement('div', { className: 'min-h-screen bg-background' }, react_1.default.createElement('div', { className: 'container mx-auto px-4 py-8' }, react_1.default.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'QuizBooth'), react_1.default.createElement('p', { className: 'text-xl text-center text-muted-foreground mb-8' }, 'Create AI-powered custom trivia games for trade shows and events'), react_1.default.createElement('div', { className: 'text-center' }, react_1.default.createElement('a', {
    href: '/setup',
    className: 'bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors'
}, 'Create Your Game')))));
const AboutPage = () => (react_1.default.createElement('div', { className: 'min-h-screen bg-background' }, react_1.default.createElement('div', { className: 'container mx-auto px-4 py-8' }, react_1.default.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'About QuizBooth'), react_1.default.createElement('div', { className: 'max-w-2xl mx-auto text-lg text-muted-foreground' }, react_1.default.createElement('p', { className: 'mb-4' }, 'QuizBooth is an AI-powered platform that helps businesses create engaging trivia games for trade shows, events, and marketing campaigns.'), react_1.default.createElement('p', { className: 'mb-4' }, 'Our mission is to make it easy for companies to capture leads, engage customers, and drive business growth through interactive gameplay.')))));
const QuizGamesPage = ({ publicGames = [] }) => (react_1.default.createElement('div', { className: 'min-h-screen bg-background' }, react_1.default.createElement('div', { className: 'container mx-auto px-4 py-8' }, react_1.default.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Public Quiz Games'), react_1.default.createElement('p', { className: 'text-center text-muted-foreground mb-8' }, 'Browse and play trivia games created by the QuizBooth community'), publicGames && publicGames.length > 0 ? (react_1.default.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }, publicGames.slice(0, 6).map((game) => react_1.default.createElement('div', { key: game.id, className: 'bg-card border rounded-lg p-6' }, react_1.default.createElement('h3', { className: 'text-xl font-semibold mb-2' }, game.title || 'Untitled Game'), react_1.default.createElement('p', { className: 'text-muted-foreground mb-4' }, game.description || 'No description available'), react_1.default.createElement('a', {
    href: `/game/${game.id}`,
    className: 'bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors'
}, 'Play Game'))))) : (react_1.default.createElement('div', { className: 'text-center text-muted-foreground' }, react_1.default.createElement('p', null, 'No public games available at the moment.'), react_1.default.createElement('p', { className: 'mt-2' }, react_1.default.createElement('a', { href: '/setup', className: 'text-primary hover:underline' }, 'Create the first public game')))))));
const FAQPage = () => (react_1.default.createElement('div', { className: 'min-h-screen bg-background' }, react_1.default.createElement('div', { className: 'container mx-auto px-4 py-8' }, react_1.default.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Frequently Asked Questions'), react_1.default.createElement('div', { className: 'max-w-3xl mx-auto space-y-6' }, react_1.default.createElement('div', { className: 'bg-card border rounded-lg p-6' }, react_1.default.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'What is QuizBooth?'), react_1.default.createElement('p', { className: 'text-muted-foreground' }, 'QuizBooth is an AI-powered platform that helps businesses create engaging trivia games for trade shows, events, and marketing campaigns.')), react_1.default.createElement('div', { className: 'bg-card border rounded-lg p-6' }, react_1.default.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'How do I create a game?'), react_1.default.createElement('p', { className: 'text-muted-foreground' }, 'Simply sign up, click "Create Your Game", and our AI will help you generate questions based on your topic and difficulty preferences.')), react_1.default.createElement('div', { className: 'bg-card border rounded-lg p-6' }, react_1.default.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'Is it free to use?'), react_1.default.createElement('p', { className: 'text-muted-foreground' }, 'QuizBooth offers both free and premium plans. The free plan includes basic features while premium plans unlock advanced customization and analytics.'))))));
const PricingPage = () => (react_1.default.createElement('div', { className: 'min-h-screen bg-background' }, react_1.default.createElement('div', { className: 'container mx-auto px-4 py-8' }, react_1.default.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Pricing Plans'), react_1.default.createElement('p', { className: 'text-center text-muted-foreground mb-8' }, 'Choose the plan that works best for your business needs'), react_1.default.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto' }, 
// Free Plan
react_1.default.createElement('div', { className: 'bg-card border rounded-lg p-6' }, react_1.default.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'Free'), react_1.default.createElement('div', { className: 'text-2xl font-bold mb-4' }, '$0/month'), react_1.default.createElement('ul', { className: 'space-y-2 text-muted-foreground' }, react_1.default.createElement('li', null, '✓ Basic game creation'), react_1.default.createElement('li', null, '✓ AI question generation'), react_1.default.createElement('li', null, '✓ QR code sharing'), react_1.default.createElement('li', null, '✓ Basic analytics'))), 
// Pro Plan
react_1.default.createElement('div', { className: 'bg-card border rounded-lg p-6 border-primary' }, react_1.default.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'Pro'), react_1.default.createElement('div', { className: 'text-2xl font-bold mb-4' }, '$29/month'), react_1.default.createElement('ul', { className: 'space-y-2 text-muted-foreground' }, react_1.default.createElement('li', null, '✓ Everything in Free'), react_1.default.createElement('li', null, '✓ Advanced customization'), react_1.default.createElement('li', null, '✓ Priority support'), react_1.default.createElement('li', null, '✓ Export analytics'))), 
// Enterprise Plan
react_1.default.createElement('div', { className: 'bg-card border rounded-lg p-6' }, react_1.default.createElement('h3', { className: 'text-xl font-semibold mb-2' }, 'Enterprise'), react_1.default.createElement('div', { className: 'text-2xl font-bold mb-4' }, 'Custom'), react_1.default.createElement('ul', { className: 'space-y-2 text-muted-foreground' }, react_1.default.createElement('li', null, '✓ Everything in Pro'), react_1.default.createElement('li', null, '✓ White-label solutions'), react_1.default.createElement('li', null, '✓ API access'), react_1.default.createElement('li', null, '✓ Dedicated account manager')))))));
const ContactPage = () => (react_1.default.createElement('div', { className: 'min-h-screen bg-background' }, react_1.default.createElement('div', { className: 'container mx-auto px-4 py-8' }, react_1.default.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Contact QuizBooth'), react_1.default.createElement('p', { className: 'text-center text-muted-foreground mb-8' }, 'Have questions, feedback, or need support? We\'d love to hear from you.'), react_1.default.createElement('div', { className: 'max-w-2xl mx-auto bg-card border rounded-lg p-6' }, react_1.default.createElement('p', { className: 'text-muted-foreground mb-4' }, 'Get in touch with our team and we\'ll get back to you as soon as possible.'), react_1.default.createElement('div', { className: 'space-y-4' }, react_1.default.createElement('div', null, react_1.default.createElement('strong', null, 'Email Support:'), react_1.default.createElement('p', { className: 'text-muted-foreground' }, 'contact@quizbooth.games')), react_1.default.createElement('div', null, react_1.default.createElement('strong', null, 'Response Time:'), react_1.default.createElement('p', { className: 'text-muted-foreground' }, 'We typically respond within 24 hours during business days.')))))));
const SignInPage = () => (react_1.default.createElement('div', { className: 'min-h-screen bg-background' }, react_1.default.createElement('div', { className: 'container mx-auto px-4 py-8' }, react_1.default.createElement('h1', { className: 'text-4xl font-bold text-center mb-8' }, 'Sign In to QuizBooth'), react_1.default.createElement('p', { className: 'text-center text-muted-foreground mb-8' }, 'Access your account to create and manage trivia games'), react_1.default.createElement('div', { className: 'max-w-md mx-auto bg-card border rounded-lg p-6' }, react_1.default.createElement('p', { className: 'text-center text-muted-foreground' }, 'Sign in to access your dashboard and create engaging trivia games.')))));
const NotFoundPage = () => (react_1.default.createElement('div', { className: 'min-h-screen bg-background flex items-center justify-center' }, react_1.default.createElement('div', { className: 'text-center' }, react_1.default.createElement('h1', { className: 'text-4xl font-bold mb-4' }, 'Page Not Found'), react_1.default.createElement('p', { className: 'text-muted-foreground mb-8' }, `The page you're looking for doesn't exist.`), react_1.default.createElement('a', {
    href: '/',
    className: 'bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors'
}, 'Go Home'))));
async function renderPage(path, pageData) {
    var _a, _b;
    let Component;
    let metaTags = '';
    let structuredData = '';
    // Check if this is a dynamic route that should be handled by client-side routing
    const isDynamicRoute = path.startsWith('/game/') ||
        path.startsWith('/dashboard') ||
        path.startsWith('/setup') ||
        path.startsWith('/edit-questions/') ||
        path.startsWith('/game-created') ||
        path.startsWith('/leaderboard/') ||
        path.startsWith('/results/') ||
        path.startsWith('/submissions/');
    // Base organization structured data
    const baseOrganizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "QuizBooth",
        "url": "https://quizbooth.games",
        "logo": "https://quizbooth.games/assets/quiz-booth-icon.png",
        "description": "AI-powered platform for creating custom trivia games for trade shows and events",
        "sameAs": [],
        "contactPoint": {
            "@type": "ContactPoint",
            "email": "contact@quizbooth.games",
            "contactType": "customer service"
        }
    };
    if (isDynamicRoute) {
        // For dynamic routes, serve a generic page that will be hydrated by client-side React
        Component = () => react_1.default.createElement('div', { id: 'root' });
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
        structuredData = `
      <script type="application/ld+json">
        ${JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "QuizBooth - Interactive Trivia Games",
            "description": "Play engaging trivia games created with QuizBooth",
            "url": `https://quizbooth.games${path}`,
            "publisher": baseOrganizationData
        })}
      </script>
    `;
    }
    else {
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
                structuredData = `
          <script type="application/ld+json">
            ${JSON.stringify({
                    "@context": "https://schema.org",
                    "@graph": [
                        baseOrganizationData,
                        {
                            "@type": "WebSite",
                            "name": "QuizBooth",
                            "url": "https://quizbooth.games",
                            "description": "AI-powered platform for creating custom trivia games for trade shows and events",
                            "publisher": {
                                "@type": "Organization",
                                "name": "QuizBooth"
                            }
                        },
                        {
                            "@type": "SoftwareApplication",
                            "name": "QuizBooth",
                            "applicationCategory": "BusinessApplication",
                            "operatingSystem": "Web Browser",
                            "description": "AI-powered platform for creating custom trivia games for trade shows and events",
                            "url": "https://quizbooth.games",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            }
                        }
                    ]
                })}
          </script>
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
                structuredData = `
          <script type="application/ld+json">
            ${JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "Public Quiz Games - QuizBooth",
                    "description": "Browse and play public trivia games created by the QuizBooth community",
                    "url": "https://quizbooth.games/quiz-games",
                    "mainEntity": {
                        "@type": "ItemList",
                        "name": "Public Trivia Games",
                        "description": "Collection of public trivia games available to play",
                        "numberOfItems": ((_a = pageData === null || pageData === void 0 ? void 0 : pageData.publicGames) === null || _a === void 0 ? void 0 : _a.length) || 0,
                        "itemListElement": ((_b = pageData === null || pageData === void 0 ? void 0 : pageData.publicGames) === null || _b === void 0 ? void 0 : _b.slice(0, 6).map((game, index) => ({
                            "@type": "ListItem",
                            "position": index + 1,
                            "item": {
                                "@type": "Game",
                                "name": game.title || "Untitled Game",
                                "description": game.description || "No description available",
                                "url": `https://quizbooth.games/game/${game.id}`,
                                "gameLocation": "Online",
                                "numberOfPlayers": "1"
                            }
                        }))) || []
                    }
                })}
          </script>
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
                structuredData = `
          <script type="application/ld+json">
            ${JSON.stringify({
                    "@context": "https://schema.org",
                    "@graph": [
                        baseOrganizationData,
                        {
                            "@type": "AboutPage",
                            "name": "About QuizBooth",
                            "description": "Learn about QuizBooth's mission to create engaging trivia experiences for businesses and events",
                            "url": "https://quizbooth.games/about",
                            "publisher": baseOrganizationData
                        }
                    ]
                })}
          </script>
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
                structuredData = `
          <script type="application/ld+json">
            ${JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "name": "QuizBooth FAQ",
                    "description": "Frequently asked questions about creating and playing trivia games with QuizBooth",
                    "url": "https://quizbooth.games/faq",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "What is QuizBooth?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "QuizBooth is an AI-powered platform that helps businesses create engaging trivia games for trade shows, events, and marketing campaigns."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "How do I create a game?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Simply sign up, click 'Create Your Game', and our AI will help you generate questions based on your topic and difficulty preferences."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Is it free to use?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "QuizBooth offers both free and premium plans. The free plan includes basic features while premium plans unlock advanced customization and analytics."
                            }
                        }
                    ]
                })}
          </script>
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
                structuredData = `
          <script type="application/ld+json">
            ${JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": "QuizBooth Pro",
                    "description": "Premium plan for creating engaging trivia games with advanced features",
                    "brand": baseOrganizationData,
                    "offers": {
                        "@type": "AggregateOffer",
                        "offerCount": 3,
                        "offers": [
                            {
                                "@type": "Offer",
                                "name": "Free Plan",
                                "price": "0",
                                "priceCurrency": "USD",
                                "description": "Basic game creation with AI question generation"
                            },
                            {
                                "@type": "Offer",
                                "name": "Pro Plan",
                                "price": "29",
                                "priceCurrency": "USD",
                                "priceValidUntil": "2025-12-31",
                                "description": "Advanced customization and priority support"
                            },
                            {
                                "@type": "Offer",
                                "name": "Enterprise Plan",
                                "price": "0",
                                "priceCurrency": "USD",
                                "description": "Custom pricing for white-label solutions and API access"
                            }
                        ]
                    }
                })}
          </script>
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
                structuredData = `
          <script type="application/ld+json">
            ${JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "Sign In - QuizBooth",
                    "description": "Sign in to your QuizBooth account to create and manage trivia games",
                    "url": "https://quizbooth.games/auth/sign-in"
                })}
          </script>
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
                structuredData = `
          <script type="application/ld+json">
            ${JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "Complete Sign In - QuizBooth",
                    "description": "Complete your QuizBooth sign-in process",
                    "url": "https://quizbooth.games/auth/complete"
                })}
          </script>
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
                structuredData = `
          <script type="application/ld+json">
            ${JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "ContactPage",
                    "name": "Contact QuizBooth",
                    "description": "Get in touch with the QuizBooth team for support, partnerships, and inquiries",
                    "url": "https://quizbooth.games/contact",
                    "mainEntity": {
                        "@type": "ContactPoint",
                        "email": "contact@quizbooth.games",
                        "contactType": "customer service",
                        "availableLanguage": "English"
                    }
                })}
          </script>
        `;
                break;
            default:
                Component = NotFoundPage;
                metaTags = `
          <title>Page Not Found - QuizBooth</title>
          <meta name="description" content="The page you're looking for doesn't exist. Return to QuizBooth home page.">
        `;
                structuredData = `
          <script type="application/ld+json">
            ${JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "Page Not Found - QuizBooth",
                    "description": "The page you're looking for doesn't exist",
                    "url": "https://quizbooth.games${path}"
                })}
          </script>
        `;
        }
    }
    const html = (0, server_1.renderToString)(react_1.default.createElement(Component, pageData));
    return { html, metaTags, structuredData };
}
exports.renderPage = renderPage;
//# sourceMappingURL=renderer.js.map