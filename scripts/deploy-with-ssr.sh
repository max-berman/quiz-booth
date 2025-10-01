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
echo "📄 SSR-enabled pages: /, /about, /quiz-games, /faq"
