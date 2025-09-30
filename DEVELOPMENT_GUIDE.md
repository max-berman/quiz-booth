# Development Guide

This guide covers the development workflow for the Quiz Booth application using Firebase.

## Development with Firebase Emulators

The recommended way to develop locally is using Firebase Emulators, which provide a complete local Firebase environment.

### Setup Emulators

```bash
# Install Firebase CLI globally if not already done
npm install -g firebase-tools

# Login to Firebase (required for emulators)
firebase login

# Start all emulators
npm run emulate

# Or start specific emulators
firebase emulators:start --only functions,firestore,auth,hosting
```

### Development with Emulators

1. **Start the emulators**:

   ```bash
   npm run emulate
   ```

2. **In a separate terminal, start the client development server**:

   ```bash
   npm run dev:client
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173 (Vite dev server)
   - Emulator UI: http://localhost:4000 (Firebase Emulator Suite)

### Environment Configuration for Emulators

Create a `.env.development` file in the root directory:

```env
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_API_KEY=fake-api-key
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_PROJECT_ID=demo-quiz-booth
VITE_FIREBASE_STORAGE_BUCKET=demo-quiz-booth.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Firebase Functions Shell

For testing Firebase Functions directly:

```bash
# Build and start Firebase Functions shell
cd firebase-functions
npm run shell

# This provides an interactive environment to call functions
# Example: createGame({ title: "Test Game", questionCount: 5 })
```

## Development Scripts Available

### Main Scripts

- `npm run emulate` - Start Firebase Emulators
- `npm run dev:client` - Start the client development server
- `npm run build:client` - Build the client for production
- `npm run build:functions` - Build Firebase Functions

### Firebase Functions Scripts (in firebase-functions directory)

- `npm run serve` - Build and serve functions with emulators
- `npm run shell` - Interactive functions shell
- `npm run build` - Build functions TypeScript

## Important Notes

### 1. Database Connection

- All data is stored in Firestore (emulated locally)
- Backend functionality is provided by Firebase Functions

### 2. Authentication

- Firebase Authentication is used for user management
- The emulator provides local auth testing
- User setup is automatic via the `userSetup` function

### 3. API Calls

- Frontend calls Firebase Functions for all backend operations
- The `use-firebase-functions.ts` hook handles all Firebase Function calls
- Error handling and authentication are managed by Firebase

### 4. Environment Variables

- Production: Set in Firebase Functions config
- Development: Use `.env.development` for emulator configuration
- The application automatically detects if emulators are being used

## Troubleshooting

### Emulator Connection Issues

```bash
# Reset emulators
firebase emulators:start --only functions,firestore --export-on-exit

# Clear emulator data
rm -rf .firebase/emulators
```

### Function Build Issues

```bash
# Clean build
cd firebase-functions
rm -rf lib
npm run build
```

### Client Connection Issues

- Ensure the client is using the correct Firebase configuration
- Check that `VITE_USE_FIREBASE_EMULATOR` is set correctly
- Verify the emulators are running on the expected ports

## Server-Side Rendering (SSR) Development

The application includes Firebase Functions-based SSR for SEO optimization on main pages.

### SSR Architecture

- **Framework**: Firebase Functions with Express.js
- **Pages**: Home, About, Quiz Games, FAQ
- **Features**: Dynamic meta tags, Firestore data fetching, security headers
- **Performance**: 1-hour caching, graceful fallback to client-side rendering

### Testing SSR Locally

1. **Start SSR with Emulators**:

   ```bash
   npm run emulate
   ```

2. **Test SSR Routes**:

   - Home: `http://localhost:5001/demo-quiz-booth/us-central1/ssr/`
   - About: `http://localhost:5001/demo-quiz-booth/us-central1/ssr/about`
   - Quiz Games: `http://localhost:5001/demo-quiz-booth/us-central1/ssr/quiz-games`
   - FAQ: `http://localhost:5001/demo-quiz-booth/us-central1/ssr/faq`

3. **Verify SSR Features**:
   - Server-generated HTML with proper meta tags
   - Dynamic content from Firestore
   - Security headers (X-Frame-Options, XSS Protection)
   - 1-hour caching for performance

### SSR Development Workflow

1. **Modify SSR Pages**:

   - Update page components in `client/src/pages/`
   - SSR automatically picks up changes in production
   - For local testing, rebuild and redeploy functions

2. **Add New SSR Routes**:

   - Add route in `firebase-functions/src/ssr/index.ts`
   - Create corresponding page component
   - Update meta tags and SEO content

3. **SSR Testing Commands**:

   ```bash
   # Test SSR locally
   npm run test:ssr

   # Build and deploy SSR functions
   npm run deploy:ssr
   ```

## Testing

To verify the application is working:

1. Start emulators: `npm run emulate`
2. Start client: `npm run dev:client`
3. Open http://localhost:5173
4. Test authentication, game creation, and question generation
5. Check the emulator UI at http://localhost:4000 for logs and data
6. Test SSR routes via Firebase Functions endpoints

This development setup provides a complete local Firebase environment that mirrors the production setup while maintaining fast development iteration.
