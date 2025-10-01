# Tech Context: Quiz Booth

## Technology Stack

### Frontend Technologies

- **React 18**: Latest React with concurrent features and improved performance
- **TypeScript 5.6**: Full-stack type safety with strict configuration
- **Vite 6.3.6**: Fast development server and optimized production builds
- **Tailwind CSS 3.4.17**: Utility-first CSS framework with custom theme
- **Radix UI**: Accessible, unstyled component primitives
- **Wouter**: Lightweight routing library
- **React Query (TanStack)**: Server state management with caching
- **React Hook Form**: Form handling with validation
- **Lucide React**: Modern icon library

### Backend Technologies

- **Firebase Functions**: Serverless backend with Node.js runtime
- **Firebase Firestore**: NoSQL database with real-time capabilities
- **Firebase Auth**: Authentication service with Google Sign-in
- **Firebase Hosting**: Global CDN with SSR support
- **DeepSeek API**: AI service for question generation
- **Express**: Web framework for Firebase Functions
- **Zod**: Runtime type validation

### Development Tools

- **Node.js 18+**: Runtime environment
- **npm**: Package manager
- **TypeScript**: Language and compiler
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Firebase CLI**: Firebase deployment and management
- **Firebase Emulators**: Local development environment

## Development Setup

### Prerequisites

- Node.js 18+ installed
- Firebase project configured
- DeepSeek API key
- Git for version control

### Environment Configuration

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Installation Steps

1. Clone repository: `git clone https://github.com/max-berman/quiz-booth.git`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env` file
4. Start development: `npm run dev:client` or `npm run emulate`

## Project Structure

### Root Directory

- `client/` - React frontend application
- `firebase-functions/` - Backend Firebase Functions
- `shared/` - Shared TypeScript types and schemas
- `memory-bank/` - Project documentation and context
- `attached_assets/` - Documentation and asset files

### Client Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route-based page components
│   ├── contexts/      # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility libraries and configurations
│   └── assets/        # Static assets and images
├── public/            # Public assets and PWA files
└── index.html         # Entry HTML file
```

### Firebase Functions Structure

```
firebase-functions/
├── src/
│   ├── games/         # Game management functions
│   ├── questions/     # Question generation functions
│   ├── usage/         # Usage tracking functions
│   ├── auth/          # Authentication functions
│   ├── ssr/           # Server-side rendering
│   └── lib/           # Shared utilities
└── lib/               # Compiled JavaScript files
```

## Key Dependencies

### Frontend Dependencies

- **@tanstack/react-query**: Server state management
- **@radix-ui/react-\***: Accessible UI components
- **wouter**: Lightweight routing
- **react-hook-form**: Form handling
- **lucide-react**: Icons
- **qrcode**: QR code generation
- **firebase**: Firebase SDK

### Backend Dependencies

- **firebase-admin**: Firebase Admin SDK
- **express**: Web framework
- **zod**: Runtime validation
- **express-rate-limit**: Rate limiting
- **nanoid**: ID generation

### Development Dependencies

- **@types/\***: TypeScript definitions
- **@vitejs/plugin-react**: Vite React plugin
- **tailwindcss**: CSS framework
- **typescript**: TypeScript compiler
- **vite**: Build tool

## Build and Deployment

### Development Commands

- `npm run dev:client` - Start client development server
- `npm run emulate` - Start Firebase emulators
- `npm run build:client` - Build client for production
- `npm run build:functions` - Build Firebase Functions

### Deployment Commands

- `npm run deploy:hosting` - Deploy to Firebase Hosting
- `npm run deploy:functions` - Deploy Firebase Functions
- `npm run deploy:firestore` - Deploy Firestore rules
- `npm run deploy:all` - Deploy everything with SSR

### Build Process

1. **Client Build**: Vite builds optimized React application
2. **Functions Build**: TypeScript compilation to JavaScript
3. **SSR Setup**: Server-side rendering configuration
4. **Deployment**: Firebase CLI deployment to hosting and functions

## Configuration Files

### Key Configuration Files

- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `firebase.json` - Firebase deployment configuration
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore indexes

### TypeScript Configuration

- Strict type checking enabled
- ES2022 target with module resolution
- Path aliases for cleaner imports
- Shared types between frontend and backend

### Firebase Configuration

- Functions region: us-central1
- Memory: 256MB for functions
- Timeout: 60 seconds for functions
- SSR enabled for main pages

## Development Workflow

### Local Development

1. Start Firebase emulators: `npm run emulate`
2. Start client development: `npm run dev:client`
3. Access application at `http://localhost:5173`
4. Emulator suite at `http://localhost:4000`

### Code Organization

- **Components**: Reusable UI components in `client/src/components/`
- **Pages**: Route-based components in `client/src/pages/`
- **Hooks**: Custom React hooks in `client/src/hooks/`
- **Contexts**: React context providers in `client/src/contexts/`
- **Utilities**: Helper functions in `client/src/lib/`
- **API Functions**: Backend functions in `firebase-functions/src/`

### Code Standards

- TypeScript for all new code
- Functional components with hooks
- Tailwind CSS for styling
- Radix UI for accessible components
- React Query for server state
- Consistent file naming (kebab-case)

## API Integration

### Firebase Functions API

- RESTful endpoints with Express
- Type-safe request/response handling
- Authentication middleware
- Rate limiting protection
- Error handling with structured responses

### DeepSeek AI Integration

- HTTP API integration for question generation
- Prompt engineering for context-aware questions
- Response validation and formatting
- Rate limiting to manage costs
- Fallback handling for API failures

### External Services

- **Firebase Auth**: User authentication
- **Firebase Firestore**: Database operations
- **Firebase Hosting**: Application hosting
- **DeepSeek API**: AI question generation
- **QR Code Generation**: Client-side QR codes

## Performance Considerations

### Frontend Performance

- Code splitting with lazy loading
- Optimized bundle size with tree shaking
- Image optimization and responsive images
- PWA capabilities for offline support
- Efficient state management with React Query

### Backend Performance

- Function memory and timeout optimization
- Firestore query optimization with indexes
- Intelligent caching strategies
- Rate limiting to prevent abuse
- Cold start optimization

### Database Performance

- Appropriate Firestore indexes
- Efficient query patterns
- Real-time updates for leaderboards
- Batch operations where possible
- Data modeling for performance

## Security Considerations

### Authentication Security

- Firebase Auth with Google Sign-in
- JWT token validation
- Secure creator key system
- Proper authorization checks
- Session management

### Data Security

- Firestore security rules
- Input validation with Zod
- Output sanitization
- Rate limiting protection
- API key protection

### Application Security

- HTTPS enforcement
- CORS configuration
- Content Security Policy
- XSS protection
- CSRF protection

## Monitoring and Logging

### Application Monitoring

- Firebase Functions logs
- Client-side error tracking
- Performance monitoring
- Usage analytics
- Error reporting

### Development Monitoring

- TypeScript compilation
- ESLint code quality
- Build process monitoring
- Deployment status
- Test coverage

## Testing Strategy

### Testing Tools

- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Firebase Emulators**: Integration testing
- **Cypress**: End-to-end testing

### Test Coverage

- Unit tests for utility functions
- Component tests for UI components
- Integration tests for API endpoints
- End-to-end tests for user flows
- Performance tests for critical paths

## Deployment Architecture

### Production Environment

- **Firebase Hosting**: Global CDN with custom domain
- **Firebase Functions**: Serverless backend
- **Firebase Firestore**: NoSQL database
- **Firebase Auth**: Authentication service

### Development Environment

- Local Firebase emulators
- Development Firebase project
- Staging environment for testing
- CI/CD pipeline for deployments

### Deployment Process

1. Code changes pushed to repository
2. Automated testing runs
3. Build process creates production artifacts
4. Deployment to Firebase services
5. Post-deployment verification
