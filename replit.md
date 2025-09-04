# Overview

This is a Trade Show Trivia application that generates AI-powered custom trivia games for trade show booths. The application allows companies to create engaging trivia experiences with questions tailored to their industry and business, helping them attract visitors and capture leads at trade shows.

The system generates trivia questions using the DeepSeek AI API based on company information, manages player participation, tracks scores, and displays leaderboards to create competitive engagement.

# User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes and Improvements (January 2025)

✓ **Creator Dashboard & QR Code Features (Latest Update):**
- Built comprehensive creator dashboard with organized card-based layout for all games
- Added QR code generation and download functionality for easy game sharing at events
- Integrated share and embed buttons directly into dashboard for quick access
- Moved raw data access from game results to dashboard for better creator workflow
- Simplified creator header navigation with direct links to dashboard and game creation
- Fixed responsive design on game completion screen with improved button layout
- Enhanced dashboard cards with game details, categories, difficulty levels, and action buttons

✓ **Firebase Database Integration:**
- Successfully migrated from PostgreSQL to Firebase Firestore for cloud-native data storage
- Implemented FirebaseStorage class with full CRUD operations using Firebase Admin SDK
- Configured real-time NoSQL document database with automatic scaling
- Enhanced data persistence and reliability with Google Cloud infrastructure
- All existing functionality maintained with improved performance and scalability

✓ **Naknick.com Design Implementation:**
- Complete visual redesign matching naknick.com's modern gaming aesthetic
- Implemented vibrant color scheme with red, blue, purple, and green gradients
- Added gaming-inspired animations (glow effects, floating elements, slide-ups)
- Enhanced typography with responsive text scales and gradient text effects
- Redesigned home page with naknick.com content structure and messaging
- Updated game interface with modern card designs and improved user experience
- Added custom CSS classes for consistent naknick branding throughout the app

## Previous Updates

✓ Enhanced Setup Form:
- Added more industry options (9 total including Food & Beverage, Education, Real Estate)
- Added custom question category with text input for specific requirements
- Added navigation links to Home and Leaderboard pages

✓ Improved Player Registration:
- Changed Company field to Email field for better lead capture
- Added email validation and proper input type

✓ Share & Embed Features:
- Created comprehensive share/embed modal component
- Added game-specific sharing with direct links
- Added embed code generation for website integration
- Added builder sharing option on home page

✓ Enhanced User Experience:
- Better navigation between pages
- Improved form validation and error handling
- More intuitive UI flow from setup to game completion

✓ Updated Industry Options:
- Added Gaming, Entertainment, Agriculture, Education industries
- Removed Finance and Healthcare industries
- Expanded to 10 total industry options

✓ Improved Question Generation Logic:
- Enhanced category-specific instructions for AI question generation
- Company Facts: Questions specifically about the company
- Industry Knowledge: Questions about the industry in general
- Fun Facts: Entertaining industry-related trivia
- General Knowledge: Not industry/company specific

✓ Raw Data Submissions Viewer:
- Created submissions page for trivia game builders
- View all player submissions with detailed statistics
- Export functionality to CSV for lead management
- Performance analytics with completion times and scores

✓ Secure Access Control System:
- Added creator key authentication for game data access
- Only trivia game creators can view their submission data
- Creator keys stored securely in browser localStorage
- API endpoints protected with authorization headers
- Proper error handling for unauthorized access attempts

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
- **Database**: Firebase Firestore for NoSQL cloud database operations
- **Connection**: Firebase Admin SDK with service account authentication
- **Schema**: Document-based collections for games, questions, and players with flexible data structure
- **Storage Implementation**: FirebaseStorage class implementing IStorage interface with full CRUD operations
- **Scalability**: Automatic scaling with Firebase's serverless architecture
- **Security**: Creator key authentication system ensures only game creators can access their submission data

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
- **Firebase Firestore**: Google Cloud NoSQL database with real-time capabilities
- **Connection Management**: Service account authentication with project-based configuration

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