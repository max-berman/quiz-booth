# Active Context: Quiz Booth

## Current Work Focus

### Recent Development Activities

- **Code Review & Improvements**: Comprehensive code review of `client/src/pages/game.tsx` with multiple fixes applied
- **Critical Issue Fixes**:
  - Added null checking for game ID parameter to prevent runtime errors
  - Fixed timer race condition by using `useCallback` for `handleNextQuestion` function
  - Added proper dependency arrays to prevent stale closures
- **Warning Issue Fixes**:
  - Removed unused imports (CheckCircle, Zap, Home, ArrowRight, Lightbulb, RotateCcw, Lock)
  - Improved type assertions with proper error handling in query functions
  - Wrapped console logs in development environment checks
- **Code Quality Improvements**:
  - Added comprehensive JSDoc documentation for GamePage component
  - Improved error handling in API queries with proper error messages
  - Enhanced code organization and readability
- **Anti-Cheating System**: Implemented comprehensive anti-cheating protection to prevent score manipulation through game replay
- **First Completion Lock**: Created system to lock scores after first game completion, preventing replay attempts
- **Session-Based Protection**: Enhanced game page to detect completed sessions and redirect to results page
- **UI Score Locking**: Added visual indicators for locked scores and clear messaging for replay attempts
- **SSR Removal**: Completely eliminated Server-Side Rendering (SSR) functionality to simplify development and deployment
- **Firebase Configuration Update**: Removed SSR rewrites and simplified Firebase hosting configuration
- **Package Scripts Simplification**: Removed SSR-related scripts and simplified deployment process
- **Vite Configuration Update**: Removed SSR-specific build settings and restored standard chunking
- **File Cleanup**: Removed SSR-related files including SSR handler, renderer, and configuration files
- **Development Workflow Improvement**: Now using standard Vite development server with hot reload
- **Deployment Fixes**: Resolved module resolution errors and build output structure issues
- **Constants Configuration**: Added dedicated constants file for score validation configuration
- **Build Process Enhancement**: Implemented copy-files script to fix TypeScript output directory structure
- **Script Cleanup**: Removed commented-out code from deployment script for better readability
- **Import Optimization**: Updated imports to use local config files instead of shared modules
- **Asset Serving Fix**: Fixed production deployment asset serving issues by removing incorrect Firebase hosting rewrite rule that was preventing static assets from being served with correct MIME types
- **Security Vulnerability Fix**: Implemented secure results transfer system to prevent URL parameter manipulation
- **Session-Based Results Storage**: Replaced insecure URL parameter passing with secure localStorage session storage
- **Server-Side Score Validation**: Added comprehensive validation in Firebase functions to detect and prevent score manipulation
- **Environment Configuration System**: Implemented comprehensive environment-specific configuration for development and production environments
- **UI Component Enhancement**: Improved game preview, customization, game, and leaderboard components with better styling and functionality
- **Color Utilities**: Created comprehensive color-utils.ts for consistent color management across the application
- **Memory Bank Update**: Comprehensive review and update of all project documentation
- **Timer System Analysis**: Detailed review of timer logic implementation and identified race conditions
- **API Endpoint Development**: Added game-specific API endpoints for questions count and play count
- **Session Management Enhancement**: Improved game session hook with comprehensive state management
- **Performance Monitoring**: Ongoing focus on timer reliability and user experience
- **Firebase Routing Fix**: Resolved 404 error for game-customization page by adding missing route to Firebase hosting configuration
- **Storage Rules Fix**: Fixed Firebase Storage rules to allow public read access for game logos in public game cards
- **API Consistency Fix**: Resolved CORS errors by implementing consistent `httpsCallable` pattern across all Firebase Functions
- **Mobile Swipe Gestures**: Added swipe left functionality for mobile devices to trigger next question navigation
- **Mobile Button Fix**: Fixed mobile button tapability by disabling preventDefault in swipe gesture handler
- **Vibration Feedback**: Added vibration feedback (200ms) for wrong answers with browser compatibility checking

### Current Development State

- **Version**: 2.0.0 - Production ready
- **Status**: Fully functional with comprehensive feature set
- **Last Major Update**: Timer system implementation with resume functionality
- **Recent Focus**: Timer logic analysis and memory bank maintenance
- **Current Analysis**: Timer race condition identified and documented for future resolution

## Recent Changes and Decisions

### Technical Decisions Made

1. **Timer Resume System**: Implemented comprehensive timer state management with session persistence
2. **Interval-Based Saving**: Timer state saved at 25, 20, 15, 10, and 5 second intervals for reliability
3. **Page Unload Protection**: Added `beforeunload` event listener to save timer state immediately
4. **Race Condition Resolution**: Fixed timer initialization race condition between session loading and question reset
5. **Safety Buffer**: Added 5-second safety buffer when resuming timers below 5 seconds
6. **SSR Asset Resolution**: Implemented automated asset file name updates for SSR to prevent 404 errors
7. **Forced Deployment**: Added `--force` flag to Firebase deployment to prevent skipping when asset resolver changes

### SSR Improvements and Hydration Error Fixes

**Problems Identified:**

1. **Hydration Errors on FAQ Page**: `RadioIndicator` must be used within `Radio` errors on hard refresh
2. **Nested Root Divs**: Dynamic routes had nested `<div id="root"><div id="root"></div></div>` structure
3. **Inconsistent SSR**: Different frontend experiences between development and production

**Root Causes:**

1. **Complex Radix UI Components**: FAQ page used Accordion components that caused hydration mismatches between SSR and client
2. **Dynamic Route Structure**: Dynamic routes were returning `<div id="root"></div>` which got wrapped in another `<div id="root">` by the template
3. **Hardcoded Route Logic**: Dynamic route detection was inline in the renderer, making it hard to maintain

**Solutions Implemented:**

1. **Dynamic Routes Configuration**:

   - Created `firebase-functions/src/ssr/config/dynamic-routes.ts`
   - Moved route logic to config file for better maintainability
   - Routes: `/game/`, `/dashboard`, `/edit-questions/`, `/game-created`, `/leaderboard/`, `/results/`, `/submissions/`

2. **FAQ Page Simplification**:

   - Removed Radix UI Accordion components causing hydration errors
   - Replaced with basic HTML `<details>` and `<summary>` elements
   - Maintained same visual appearance and functionality

3. **Nested Div Fix**:

   - Changed dynamic route components to use `React.Fragment` instead of creating duplicate root divs
   - Now dynamic routes have clean: `<div id="root"></div>`

4. **SSR Development Guide**:
   - Created comprehensive `SSR_DEVELOPMENT_GUIDE.md`
   - Added validation script: `scripts/validate-ssr-consistency.js`

**Technical Implementation:**

```typescript
// Dynamic routes configuration
export const DYNAMIC_ROUTES = [
	'/game/',
	'/dashboard',
	'/edit-questions/',
	'/game-created',
	'/leaderboard/',
	'/results/',
	'/submissions/',
] as const

export function isDynamicRoute(path: string): boolean {
	return DYNAMIC_ROUTES.some((route) => path.startsWith(route))
}

// SSR renderer now uses config
if (isDynamicRoute(path)) {
	// For dynamic routes, serve empty root div for client-side hydration
	Component = () => React.createElement(React.Fragment)
}
```

### Production Deployment Asset Resolution Fix

- Production site was serving old asset file names (`index-Bgbe2GQi.css`, `vendor-icons-lCX8gI2t.js`, `index-TNabJ5o-.js`)
- SSR handler was using outdated asset references causing 404 errors and incorrect MIME types
- Firebase Functions deployment was being skipped even when asset resolver was updated

**Root Causes:**

1. **Hardcoded asset file names** in SSR handler that weren't being updated automatically
2. **Firebase Functions deployment skipping** when Firebase didn't detect changes
3. **Caching issues** where old SSR handler responses were being served

**Solution Implemented:**

1. **Automated Asset Resolver Updates**: `scripts/update-ssr-assets.js` automatically updates asset file names after each build
2. **Deployment Hash System**: Automatic hash generation based on current asset file names to force redeployment
3. **Forced Deployment**: Added `--force` flag to `firebase deploy` command to prevent skipping
4. **Hosting Cache Clear**: Redeployed hosting to clear cached responses

**Critical Fix in Deployment Script:**

```bash
# BEFORE: Could skip deployment if Firebase doesn't detect changes
firebase deploy

# AFTER: Forces deployment even when no changes detected
firebase deploy --force
```

**Deployment Process Now:**

1. Build client → Update SSR assets → Rebuild functions → Force deployment
2. Automatic deployment hash ensures functions are redeployed when assets change
3. Production always serves correct asset file names with proper MIME types

### Timer System Implementation

**Key Features Implemented:**

- 30-second per-question timer with real-time countdown
- Session persistence for timer state across page refreshes
- Automatic time-out handling with question advancement
- Visual feedback with color changes and animations for low time
- Score calculation based on time remaining and streak bonuses

**Technical Implementation:**

```typescript
// Timer initialization with resume capability
useEffect(() => {
	if (isSessionLoaded) {
		if (sessionState?.currentQuestionTimeLeft !== undefined) {
			// Resume from saved state with safety buffer
			let resumedTime = sessionState.currentQuestionTimeLeft
			if (resumedTime < 5) {
				resumedTime = Math.min(resumedTime + 5, QUESTION_TIMER_DURATION)
			}
			setTimeLeft(resumedTime)
		} else {
			// Start new question with full timer
			setTimeLeft(QUESTION_TIMER_DURATION)
		}
	}
}, [
	isSessionLoaded,
	sessionState?.currentQuestionTimeLeft,
	QUESTION_TIMER_DURATION,
])
```

### Documentation Cleanup (Completed)

- **Memory Bank Update**: Comprehensive review and update of all memory bank files
- **Timer Documentation**: Detailed analysis of timer logic and implementation patterns
- **Project State Capture**: Current project status and technical decisions documented

### Architecture Patterns Established

- **Monorepo Structure**: Clear separation between client, server, and shared code
- **Type Safety**: Full-stack TypeScript with shared types
- **Serverless Backend**: Firebase Functions for scalability
- **Modern Frontend**: React 18 with Vite and Tailwind CSS
- **Real-time Features**: Firestore for live leaderboards and updates
- **Session Management**: Comprehensive game session state management

## Active Development Considerations

### Current Technical Priorities

1. **Timer Reliability**: Ensuring timer state persistence works reliably across all scenarios
2. **Performance Monitoring**: Optimizing function memory and timeout settings
3. **Error Handling**: Comprehensive error tracking and user-friendly messages
4. **Security**: Input validation, rate limiting, and authentication security
5. **User Experience**: Mobile-first design and accessibility

### Known Technical Challenges

- **Timer Race Conditions**: Resolved race condition between session loading and question reset
- **Cold Start Optimization**: Firebase Functions cold start times
- **AI API Costs**: Managing DeepSeek API usage and costs
- **Real-time Performance**: Leaderboard updates and caching strategies
- **Cross-Device Authentication**: Firebase Auth synchronization

## Important Patterns and Preferences

### Code Organization Patterns

- **Component Structure**: Page components, UI components, layout components
- **State Management**: React Query for server state, Context API for client state
- **File Naming**: kebab-case for all files and components
- **Import Organization**: Path aliases for cleaner imports
- **Type Definitions**: Shared types in `shared/` directory

### Timer Implementation Patterns

- **Session Persistence**: Timer state saved in session storage for resume capability
- **Interval Saving**: Multiple save points for reliability
- **Safety Buffers**: Graceful handling of edge cases
- **Visual Feedback**: Clear user indication of timer state
- **Error Recovery**: Robust error handling for timer failures

### Development Workflow Preferences

- **Local Development**: Firebase emulators for full-stack testing
- **Build Process**: Vite for client, TypeScript compilation for functions
- **Deployment**: Automated deployment scripts with SSR
- **Testing Strategy**: Unit, integration, and end-to-end testing
- **Documentation**: Comprehensive README and memory bank

### Firebase Routing Configuration (CRITICAL)

**IMPORTANT**: When creating new pages with client-side routing, you MUST add the route to Firebase hosting rewrites configuration in `firebase.json` to prevent 404 errors on hard refresh.

**Problem**: Client-side routing works when navigating from internal links but fails on hard refresh because Firebase Hosting doesn't know how to handle the route.

**Solution**: Add the route pattern to the `rewrites` array in `firebase.json`:

```json
{
	"source": "/your-new-route/**",
	"function": "ssrHandler"
}
```

**Example**: For `/game-customization/:id` route, add:

```json
{
	"source": "/game-customization/**",
	"function": "ssrHandler"
}
```

**Required for all new routes**: Any new page route added to the React router must also be added to Firebase hosting configuration.

### Performance Patterns

- **Caching Strategy**:
  - Games: 2 minutes TTL
  - Questions: 1 minute TTL
  - Leaderboards: 30 seconds TTL
- **Lazy Loading**: Route and component-level code splitting
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Image Optimization**: Responsive images and asset optimization

## Learnings and Project Insights

### Technical Insights

- **Timer Implementation**: Complex state management required for reliable resume functionality
- **Race Conditions**: Careful useEffect ordering needed for proper initialization
- **Session Management**: Comprehensive session state improves user experience
- **Firebase Functions**: Memory and timeout optimization is critical for performance
- **Real-time Updates**: Firestore real-time listeners work well for leaderboards

### User Experience Insights

- **Timer Feedback**: Visual and auditory cues improve user engagement
- **Session Persistence**: Users expect to resume where they left off
- **Mobile Experience**: Trade show usage requires excellent mobile performance
- **Error Recovery**: Graceful handling of network issues and interruptions
- **Performance**: Fast loading and responsive interactions are critical

### Business Insights

- **Target Market**: B2B trade show and event companies
- **Value Proposition**: Lead generation through engaging gameplay
- **Competitive Advantage**: AI-powered personalization and flexible prize system
- **Scalability**: Serverless architecture supports growth
- **User Retention**: Session persistence increases completion rates

## Next Steps and Future Work

### Immediate Next Steps

1. **Timer Testing**: Comprehensive testing of timer resume functionality
2. **Performance Monitoring**: Monitor timer reliability in production
3. **User Testing**: Gather feedback on timer experience and reliability
4. **Documentation Completion**: Finalize timer implementation documentation
5. **Bug Fixes**: Address any timer-related issues identified in testing

### Short-term Goals (1-2 months)

- **Enhanced Analytics**: Advanced reporting and insights including timer metrics
- **Question Quality**: Improved AI prompts and validation
- **Mobile Optimization**: PWA enhancements and offline capabilities
- **User Management**: Enhanced dashboard and game management
- **Integration Testing**: Comprehensive test coverage including timer scenarios

### Medium-term Goals (3-6 months)

- **CRM Integration**: Lead export and CRM system connections
- **Advanced AI**: More sophisticated question generation
- **Multi-language Support**: Internationalization and localization
- **Advanced Gamification**: Points, badges, and social features
- **Timer Customization**: Configurable timer durations per game

### Long-term Vision (6+ months)

- **Mobile App**: Native mobile application development
- **Enterprise Features**: Advanced analytics and customization
- **Marketplace**: Template sharing and community features
- **AI Assistant**: Guided game creation and optimization
- **Global Expansion**: Multi-region deployment and support

## Active Development Guidelines

### Code Standards to Maintain

- **TypeScript Everywhere**: All new code must use TypeScript
- **Functional Components**: Use React hooks and functional components
- **Accessibility**: Follow Radix UI patterns for accessible components
- **Performance**: Implement lazy loading and code splitting
- **Error Handling**: Comprehensive error boundaries and user feedback

### Timer Implementation Standards

- **Session Persistence**: Always save timer state for resume capability
- **Safety Buffers**: Implement graceful error recovery
- **Visual Feedback**: Clear user indication of timer state
- **Testing**: Comprehensive timer scenario testing
- **Documentation**: Clear documentation of timer behavior

### Testing Requirements

- **Unit Tests**: All utility functions and business logic including timer logic
- **Component Tests**: Critical UI components and interactions including timer display
- **Integration Tests**: API endpoints and database operations
- **End-to-End Tests**: Critical user journeys and flows including timer scenarios

### Deployment Checklist

**CRITICAL DEPLOYMENT REQUIREMENTS:**

- [ ] **NEVER DEPLOY CHANGES WITHOUT EXPLICIT USER PERMISSION**

  - Always ask for approval before running any deployment commands
  - Deployment can have production impact and should only be done with explicit consent

- [ ] **ALWAYS test locally before deploying to production**

  - Run `npm run build:client` and `npm run build:functions` to verify builds work
  - Test the application locally with emulators to ensure functionality

- [ ] **ALWAYS use `npm run deploy:prod` for production deployments**
  - This script invokes all relevant build and deploy scripts
  - Ensures Assets and SSR pages get correct content types
  - Ensures assets get matching build file names via SSR asset resolver
  - Includes the SSR asset resolver which is critical for preventing 404 errors

**Standard Deployment Verification:**

- [ ] All tests pass including timer scenarios
- [ ] Build process completes successfully
- [ ] SSR pages render correctly
- [ ] Authentication flows work
- [ ] AI question generation functional
- [ ] Real-time features operational
- [ ] Timer resume functionality verified
- [ ] Performance metrics within targets

## Current Technical Debt

### Areas Requiring Attention

- **Timer Edge Cases**: Additional testing needed for complex timer scenarios
- **Legacy Creator Keys**: Migration plan to Firebase Auth
- **Error Handling**: More comprehensive error tracking
- **Test Coverage**: Expand test suite coverage
- **Documentation**: Keep memory bank updated

### Technical Improvements Planned

- **Timer Customization**: Configurable timer durations per game
- **Database Indexing**: Optimize Firestore query performance
- **Caching Strategy**: Refine TTL settings based on usage patterns
- **Bundle Size**: Further optimize client bundle size
- **Function Optimization**: Memory and timeout tuning

## Active Development Environment

### Current Setup

- **Development**: Local Firebase emulators and Vite dev server
- **Testing**: Manual testing with emulator data
- **Deployment**: Firebase Hosting and Functions
- **Monitoring**: Firebase logs and basic error tracking

### Development Tools in Use

- **IDE**: VSCode with TypeScript and React extensions
- **Version Control**: Git with GitHub
- **Package Manager**: npm
- **Build Tools**: Vite, TypeScript compiler
- **Deployment**: Firebase CLI

### Environment Configuration

- **Development**: Local emulators with test data
- **Staging**: Separate Firebase project
- **Production**: Live Firebase project with custom domain
- **Environment Variables**: Firebase config and API keys
