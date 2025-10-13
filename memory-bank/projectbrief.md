# Project Brief: Quiz Booth

## Overview

Quiz Booth is a comprehensive trivia application that generates AI-powered custom trivia games for trade show booths. The application allows companies to create engaging trivia experiences with questions tailored to their industry and business, helping them attract visitors and capture leads at trade shows.

## Core Purpose

- **Business Problem**: Companies need engaging ways to attract visitors and capture leads at trade shows
- **Solution**: AI-generated custom trivia games that educate visitors about the company while providing entertainment
- **Value Proposition**: Turn passive booth visitors into engaged participants who learn about the company through interactive gameplay

## Key Features

### Core Functionality

- **AI-Powered Question Generation**: Uses DeepSeek AI to create custom trivia questions based on company information
- **Multi-Step Game Creation**: Intuitive wizard for setting up games with company details, game settings, and prize configuration
- **Real-time Leaderboards**: Live score tracking and player rankings with intelligent caching
- **Cross-Device Authentication**: Firebase Auth with Google Sign-in
- **QR Code Sharing**: Dynamic QR codes for easy game distribution at events
- **Comprehensive Analytics**: Player submissions tracking, play counts, and lead capture

### Advanced Features

- **Website-Based Company Detection**: Automatically detects when company names are website URLs for more accurate question generation
- **Flexible Prize System**: Customizable prize tiers with any placement names (1st place, top 10, etc.) with detailed prize descriptions
- **Question Management**: AI-generated question batches, single question generation with uniqueness checks, and manual editing
- **Category-Based Question Generation**: Support for multiple question categories: Company Facts, Industry Knowledge, Fun Facts, General Knowledge
- **Timer System**: 30-second per-question timer with resume capability and interval-based saving

## Target Users

- **Primary**: Companies exhibiting at trade shows and events
- **Secondary**: Event organizers, marketing teams, sales representatives
- **End Users**: Trade show attendees playing the trivia games

## Technical Scope

- **Frontend**: React 18 with TypeScript, Vite build tool, Tailwind CSS, Radix UI components
- **Backend**: Firebase Functions (Node.js), Firebase Firestore database
- **Authentication**: Firebase Auth with Google Sign-in
- **AI Integration**: DeepSeek API for question generation
- **Deployment**: Firebase Hosting with Server-Side Rendering (SSR)

## Success Metrics

- Number of games created
- Player engagement (completion rates, time spent)
- Lead capture effectiveness
- User satisfaction with AI-generated questions
- System performance and reliability

## Current Status

Version 2.0.0 - Production ready with comprehensive feature set including:

- Full authentication system (Firebase Auth + legacy creator keys)
- Advanced AI-powered question generation with DeepSeek API
- Flexible prize management with customizable placement system
- Real-time analytics and leaderboards
- PWA capabilities with offline support
- SEO optimization with server-side rendering
- Comprehensive timer system with resume functionality
- Session persistence across page refreshes
- QR code sharing and game distribution
- Cross-device authentication and synchronization

## Recent Enhancements

- **Logo Caching System**: Comprehensive custom logo URL caching to eliminate loading delays on game pages
- **Timer System**: Comprehensive 30-second per-question timer with session persistence, interval-based saving, and race condition resolution
- **SSR Asset Resolution**: Automated asset file name updates to prevent 404 errors
- **Memory Bank**: Comprehensive project documentation and maintenance
- **Performance Optimization**: Enhanced caching strategies and error handling
- **API Consistency**: Resolved CORS errors by implementing consistent `httpsCallable` pattern across all Firebase Functions

## Future Vision

- Enhanced AI capabilities for more personalized questions
- Advanced analytics and reporting with timer metrics
- Integration with CRM systems for lead management
- Multi-language support for international markets
- Mobile app development for native experience
- Advanced gamification features (points, badges, social)
- Timer customization options (configurable durations per game)
- Enterprise features for large-scale deployments
