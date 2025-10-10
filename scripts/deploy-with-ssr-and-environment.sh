#!/bin/bash

# Unified deployment script for QuizBooth with SSR and environment-aware security rules
# Usage: ./scripts/deploy-with-ssr-and-environment.sh [environment]
# Environment: development (default) or production

set -e

# Default to development if no environment specified
ENVIRONMENT=${1:-development}

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
  echo "Error: Environment must be 'development' or 'production'"
  exit 1
fi

echo "🚀 Configuring QuizBooth for $ENVIRONMENT environment..."

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check required tools
if ! command_exists firebase; then
  echo "Error: Firebase CLI is not installed or not in PATH"
  exit 1
fi

if ! command_exists npm; then
  echo "Error: npm is not installed or not in PATH"
  exit 1
fi

# Select appropriate rules based on environment
echo "📝 Using $ENVIRONMENT security rules..."

if [[ "$ENVIRONMENT" == "development" ]]; then
  # Use development rules (more permissive)
  cp firestore.rules.dev firestore.rules
  cp storage.rules.dev storage.rules
  echo "✅ Using development rules (permissive)"

    # Build the client
  echo "📦 Building client..."
  npm run build:client
  
  # Build Firebase functions for emulator use
  echo "🔨 Building Firebase functions for emulators..."
  cd firebase-functions
  npm run build
  cd ..
  
  echo ""
  echo "🔧 Development environment configured for local emulators"
  echo "   Run 'npm run emulate' to start Firebase emulators"
  echo "   Run 'npm run dev:client' to start the development server"
  echo ""
  echo "📋 Development Setup Summary:"
  echo "   - Environment: development"
  echo "   - Security Rules: development rules applied"
  echo "   - SSR: Ready for local development"
  echo "   - Firebase Functions: Built for emulators"
  echo "   - Firestore: Development rules configured"
  echo "   - Storage: Development rules configured"
  echo "   - Hosting: Ready for local development"
  
else
  # Use production rules (strict security)
  cp firestore.rules.prod firestore.rules
  cp storage.rules.prod storage.rules
  echo "✅ Using production rules (strict security)"
  
  # Build the client
  echo "📦 Building client..."
  npm run build:client

  # Rebuild Firebase functions
  echo "🔨 Building Firebase functions..."
  cd firebase-functions
  npm run build
  
  # Fix TypeScript output structure - copy built files to correct location
  echo "🔄 Fixing TypeScript output structure..."
  cp -r lib/firebase-functions/src/* lib/
  cd ..

  # Generate sitemap
  echo "🗺️  Generating sitemap..."
  npm run sitemap

  # Temporarily move static index.html to allow SSR to work
  echo "🔄 Configuring SSR for root path..."
  mv dist/public/index.html dist/public/index.html.bak

  echo "📤 Deploying to Firebase Production..."
  firebase deploy --force

  # Restore static index.html for development
  echo "🔄 Restoring static index.html for development..."
  mv dist/public/index.html.bak dist/public/index.html

  echo "✅ Deployment to production environment with SSR complete!"

  # Display SSR-enabled pages
  echo "📄 SSR-enabled pages:"
  node -e "
  const fs = require('fs');
  const rendererPath = './firebase-functions/src/ssr/renderer.ts';
  const content = fs.readFileSync(rendererPath, 'utf8');

  // Extract routes from switch statement
  const routes = [];
  const switchMatch = content.match(/switch\\s*\\(path\\)\\s*{([^}]+)}/);
  if (switchMatch) {
    const switchContent = switchMatch[1];
    const caseMatches = switchContent.matchAll(/case\\s*['\"]([^'\"]+)['\"]/g);
    for (const match of caseMatches) {
      routes.push(match[1]);
    }
  }

  // Filter out dynamic routes and auth routes
  const staticRoutes = routes.filter(route => 
    !route.includes('/game/') && 
    !route.includes('/dashboard') && 
    !route.includes('/setup') && 
    !route.includes('/edit-questions/') && 
    !route.includes('/game-created') && 
    !route.includes('/leaderboard/') && 
    !route.includes('/results/') && 
    !route.includes('/submissions/') &&
    !route.includes('/auth/complete')
  );

  console.log(staticRoutes.join(', '));
  "

  echo ""
  echo "📋 Production Deployment Summary:"
  echo "   - Environment: production"
  echo "   - Security Rules: production rules applied"
  echo "   - SSR: Enabled for configured pages"
  echo "   - Firebase Functions: Deployed"
  echo "   - Firestore: Rules and indexes deployed"
  echo "   - Storage: Rules deployed"
  echo "   - Hosting: Deployed with SSR"
fi
