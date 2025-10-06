#!/bin/bash

# Script to deploy QuizBooth with SSR enabled
# This script ensures the SSR function takes precedence over static files

echo "🚀 Deploying QuizBooth with SSR..."

# Build the client
echo "📦 Building client..."
npm run build:client

# Update SSR asset resolver with current build file names
echo "🔄 Updating SSR asset resolver..."
npm run update:ssr-assets

# Build Firebase functions
echo "🔨 Building Firebase functions..."
cd firebase-functions
npm run build
cd ..

# Generate sitemap
echo "🗺️  Generating sitemap..."
npm run sitemap

# Temporarily move static index.html to allow SSR to work
echo "🔄 Configuring SSR for root path..."
mv dist/public/index.html dist/public/index.html.bak

echo "📤 Deploying to Firebase..."
firebase deploy

# Restore static index.html for development
echo "🔄 Restoring static index.html for development..."
mv dist/public/index.html.bak dist/public/index.html

echo "✅ Deployment complete! SSR is now active for all configured pages."

# Dynamically extract SSR-enabled pages from the renderer
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
