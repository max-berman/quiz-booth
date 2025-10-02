# Active Context: Quiz Booth

## Current Work Focus

### Recent Development Activities

- **Memory Bank Update**: Comprehensive review and update of all project documentation
- **Timer System Analysis**: Detailed review of timer logic implementation and identified race conditions
- **API Endpoint Development**: Added game-specific API endpoints for questions count and play count
- **Session Management Enhancement**: Improved game session hook with comprehensive state management
- **Performance Monitoring**: Ongoing focus on timer reliability and user experience

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

- [ ] **ALWAYS test locally before deploying to production**

  - Run `npm run build:client` and `npm run build:functions` to verify builds work
  - Test the application locally with emulators to ensure functionality

- [ ] **ALWAYS use `npm run deploy:all` for production deployments**
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
