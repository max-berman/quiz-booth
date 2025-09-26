# Development Guide for Firebase Migration

After migrating to Firebase, the development workflow has changed. Here are the different ways to run the application in development mode.

## Option 1: Firebase Emulators (Recommended)

The best way to develop locally is using Firebase Emulators, which provide a complete local Firebase environment.

### Setup Emulators

```bash
# Install Firebase CLI globally if not already done
npm install -g firebase-tools

# Login to Firebase (required for emulators)
firebase login

# Start all emulators
npm run emulators

# Or start specific emulators
firebase emulators:start --only functions,firestore,auth,hosting
```

### Development with Emulators

1. **Start the emulators**:

   ```bash
   npm run emulators
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

## Option 2: Legacy Development Mode (Express Server)

If you need to test the original Express server functionality:

```bash
# Run the original Express server
npm run dev:legacy

# In another terminal, start the client
cd client
npm run dev
```

## Option 3: Firebase Functions Shell

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

- `npm run emulators` - Start Firebase Emulators
- `npm run dev:legacy` - Run original Express server (for comparison)
- `npm run dev:client` - Start only the client dev server

### Firebase Functions Scripts (in firebase-functions directory)

- `npm run serve` - Build and serve functions with emulators
- `npm run shell` - Interactive functions shell
- `npm run build` - Build functions TypeScript

## Important Notes

### 1. Database Connection

- The original PostgreSQL database is no longer used in Firebase mode
- All data is now stored in Firestore (emulated locally)
- The Express server routes are replaced by Firebase Functions

### 2. Authentication

- Firebase Authentication is used instead of custom auth
- The emulator provides local auth testing
- User setup is automatic via the `userSetup` function

### 3. API Calls

- Frontend now calls Firebase Functions instead of Express API endpoints
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

## Testing the Migration

To verify the Firebase migration is working:

1. Start emulators: `npm run emulators`
2. Start client: `cd client && npm run dev`
3. Open http://localhost:5173
4. Test authentication, game creation, and question generation
5. Check the emulator UI at http://localhost:4000 for logs and data

This development setup provides a complete local Firebase environment that mirrors the production setup while maintaining fast development iteration.
