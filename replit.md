# Overview

This is a Trade Show Trivia application that generates AI-powered custom trivia games for trade show booths. The application allows companies to create engaging trivia experiences with questions tailored to their industry and business, helping them attract visitors and capture leads at trade shows.

The system generates trivia questions using the DeepSeek AI API based on company information, manages player participation, tracks scores, and displays leaderboards to create competitive engagement.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with page-based structure (Home, Setup, Game, Results, Leaderboard)
- **UI Components**: Radix UI primitives with shadcn/ui component system for consistent design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for games, questions, players, and leaderboards
- **Development**: Hot reloading with Vite middleware integration for seamless development experience
- **Error Handling**: Centralized error middleware with proper HTTP status codes and JSON responses

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Schema**: Well-defined tables for games, questions, and players with proper relationships
- **Development Storage**: In-memory storage implementation for testing and development
- **Migrations**: Drizzle Kit for database schema migrations and version control

## Database Schema Design
- **Games Table**: Stores company information, game settings, difficulty levels, categories, and prize information
- **Questions Table**: Contains AI-generated questions with multiple choice options, correct answers, and explanations
- **Players Table**: Tracks player scores, completion times, and performance metrics
- **Relationships**: Foreign key constraints linking questions to games and players to games

## External Dependencies

### AI Integration
- **DeepSeek API**: AI service for generating custom trivia questions based on company and industry information
- **Question Generation**: Dynamic question creation with configurable difficulty levels and categories

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: Environment-based database URL configuration

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Error Reporting**: Runtime error overlay for development debugging
- **Code Mapping**: Cartographer plugin for enhanced development experience

### UI and Styling
- **Radix UI**: Accessible component primitives for dialogs, forms, navigation, and interactive elements
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant system for component styling
- **Tailwind CSS**: Utility-first CSS framework with custom configuration

### Utility Libraries
- **Zod**: Schema validation for API requests and form data
- **Date-fns**: Date manipulation and formatting utilities
- **Nanoid**: Unique ID generation for resources
- **clsx/twMerge**: Utility for conditional CSS class composition