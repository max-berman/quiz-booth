"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssrHandler = void 0;
const functions = __importStar(require("firebase-functions"));
const renderer_1 = require("./renderer");
const firestore_ssr_1 = require("./utils/firestore-ssr");
const asset_resolver_1 = require("./utils/asset-resolver");
exports.ssrHandler = functions.https.onRequest(async (req, res) => {
    try {
        const path = req.path;
        // Set security headers
        res.set('X-Frame-Options', 'DENY');
        res.set('X-Content-Type-Options', 'nosniff');
        res.set('X-XSS-Protection', '1; mode=block');
        res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        // Fetch data based on route
        const pageData = await (0, firestore_ssr_1.fetchPageData)(path, req.query);
        // Render React components to string
        const { html, metaTags } = await (0, renderer_1.renderPage)(path, pageData);
        // Get dynamically resolved asset file names
        const assets = (0, asset_resolver_1.getResolvedAssets)();
        // Generate final HTML
        const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${metaTags}
    
    <!-- Essential Meta Tags -->
    <meta name="description" content="Create AI-powered custom trivia games for trade shows and events. Engage customers, capture leads, and drive business growth through interactive gameplay." />
    <meta name="keywords" content="trivia games, business events, trade shows, lead capture, AI questions, interactive marketing" />
    <meta name="author" content="QuizBooth" />
    <meta name="robots" content="index, follow" />

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="QuizBooth - Create Engaging Trivia Games for Your Business" />
    <meta property="og:description" content="Create AI-powered custom trivia games for trade shows and events. Engage customers, capture leads, and drive business growth through interactive gameplay." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://quizbooth.games" />
    <meta property="og:image" content="/assets/quiz-booth-icon.png" />
    <meta property="og:site_name" content="QuizBooth" />

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="QuizBooth - Create Engaging Trivia Games for Your Business" />
    <meta name="twitter:description" content="Create AI-powered custom trivia games for trade shows and events. Engage customers, capture leads, and drive business growth through interactive gameplay." />
    <meta name="twitter:image" content="/assets/quiz-booth-icon.png" />

    <!-- Favicon and App Icons -->
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
    <link rel="apple-touch-icon" href="/assets/quiz-booth-icon.png">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">

    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#3b82f6" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="QuizBooth" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="application-name" content="QuizBooth" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-TileColor" content="#3b82f6" />
    <meta name="msapplication-config" content="/browserconfig.xml" />

    <!-- Canonical URL -->
    <link rel="canonical" href="https://quizbooth.games" />

    <!-- Preload Critical Resources -->
    <link rel="preload" href="/assets/fonts/Onest-Regular.ttf" as="font" type="font/ttf" crossorigin />
    <link rel="preload" href="/assets/fonts/Onest-Bold.ttf" as="font" type="font/ttf" crossorigin />
    <link rel="preload" href="/assets/fonts/Onest-Medium.ttf" as="font" type="font/ttf" crossorigin />

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "QuizBooth",
      "description": "Create AI-powered custom trivia games for trade shows and events. Engage customers, capture leads, and drive business growth through interactive gameplay.",
      "url": "https://quizbooth.games",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "category": "SoftwareApplication"
      },
      "creator": {
        "@type": "Organization",
        "name": "QuizBooth",
        "url": "https://quizbooth.games"
      },
      "featureList": [
        "AI-Powered Question Generation",
        "Lead Capture Integration",
        "QR Code Sharing",
        "Real-time Analytics",
        "Custom Branding"
      ]
    }
    </script>

    <!-- FAQ Schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is QuizBooth?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "QuizBooth is a platform that helps businesses create engaging trivia games for events and trade shows. It uses AI to generate custom questions and includes lead capture features to turn players into potential customers."
          }
        },
        {
          "@type": "Question",
          "name": "How does the AI question generation work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our AI analyzes your business context and generates relevant, engaging trivia questions in seconds. You can customize the difficulty, topics, and style to match your brand and audience."
          }
        },
        {
          "@type": "Question",
          "name": "Can I capture leads through trivia games?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! QuizBooth includes built-in lead capture functionality. Players can optionally provide their contact information before or after playing, helping you build your customer database."
          }
        },
        {
          "@type": "Question",
          "name": "How do I share my trivia game?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can share your game via QR code, direct link, or embed it on your website. Setup takes just minutes and requires no technical expertise."
          }
        },
        {
          "@type": "Question",
          "name": "Is QuizBooth suitable for trade shows?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! QuizBooth was designed specifically for trade shows and business events. It helps attract visitors to your booth, engage them with interactive content, and capture valuable leads."
          }
        }
      ]
    }
    </script>

    <link rel="stylesheet" crossorigin href="/assets/${assets.cssFile}">
    <link rel="modulepreload" crossorigin href="/assets/${assets.vendorFiles.react}">
    <link rel="modulepreload" crossorigin href="/assets/${assets.vendorFiles.radix}">
    <link rel="modulepreload" crossorigin href="/assets/${assets.vendorFiles.query}">
    <link rel="modulepreload" crossorigin href="/assets/${assets.vendorFiles.charts}">
    <link rel="modulepreload" crossorigin href="/assets/${assets.vendorFiles.icons}">
    <link rel="modulepreload" crossorigin href="/assets/${assets.vendorFiles.forms}">
</head>
<body>
    <div id="root">${html}</div>
    <script type="module" crossorigin src="/assets/${assets.jsFile}"></script>
    <script>
      // Dynamically load PWA manifest only in production
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = '/manifest.webmanifest';
        document.head.appendChild(link);
      }
    </script>
</body>
</html>`;
        res.status(200).send(finalHtml);
    }
    catch (error) {
        console.error('SSR Error:', error);
        // Serve a basic error page instead of redirecting
        // This prevents infinite loops with SSR
        const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuizBooth - Error</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
      .error-container { max-width: 600px; margin: 100px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
      h1 { color: #dc2626; margin-bottom: 20px; }
      p { color: #666; margin-bottom: 30px; }
      a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>Something went wrong</h1>
        <p>We're having trouble loading the page. Please try refreshing or come back later.</p>
        <a href="/">Go to Homepage</a>
    </div>
</body>
</html>`;
        res.status(500).send(errorHtml);
    }
});
//# sourceMappingURL=index.js.map