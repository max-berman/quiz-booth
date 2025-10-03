import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Check if we're in development mode (Vite's way)
const isDevelopment = import.meta.env.DEV;

let app: any;
let auth: any;
let storage: any;

// Check if Firebase is already initialized
const existingApps = getApps();
if (existingApps.length > 0) {
  app = existingApps[0];
  auth = getAuth(app);
} else {
  if (isDevelopment) {
    // For emulator mode, use the correct project ID that matches Firebase Functions
    const firebaseConfig = {
      apiKey: 'demo-1-api-key',
      authDomain: 'localhost',
      projectId: 'trivia-games-7a81b',
      storageBucket: 'trivia-games-7a81b.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef123456',
    };

    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);

      // Set emulator settings IMMEDIATELY after getting auth
      auth.settings.appVerificationDisabledForTesting = true;

      // Connect to emulator IMMEDIATELY - no delay
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', {
          disableWarnings: true
        });

        // Connect Functions emulator
        const functions = getFunctions(app);
        connectFunctionsEmulator(functions, 'localhost', 5001);

        // Connect Storage emulator
        storage = getStorage(app);
        connectStorageEmulator(storage, 'localhost', 9199);
      } catch (emulatorError) {
        console.error('Emulator connection failed:', emulatorError);
      }

      // Set proper persistence to maintain user session across page refreshes
      // Use browserLocalPersistence for production-like behavior
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('Failed to set persistence:', error);
      });
    } catch (error) {
      console.error('Firebase emulator setup failed:', error);
      // Don't fallback to empty config - this causes duplicate app errors
      throw error; // Let the error propagate so we can see what's wrong
    }
  } else {
    // Production configuration - use actual environment variables
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    // Validate that all required environment variables are present
    const missingVars = [];
    if (!firebaseConfig.apiKey) missingVars.push('VITE_FIREBASE_API_KEY');
    if (!firebaseConfig.authDomain) missingVars.push('VITE_FIREBASE_AUTH_DOMAIN');
    if (!firebaseConfig.projectId) missingVars.push('VITE_FIREBASE_PROJECT_ID');
    if (!firebaseConfig.appId) missingVars.push('VITE_FIREBASE_APP_ID');

    if (missingVars.length > 0) {
      console.error('Missing required Firebase environment variables:', missingVars);
      throw new Error(`Missing Firebase configuration: ${missingVars.join(', ')}`);
    }

    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      storage = getStorage(app);
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Don't fallback to empty config - this causes duplicate app errors
      throw error; // Let the error propagate so we can see what's wrong
    }

    // Set proper persistence for production
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Failed to set persistence:', error);
    });
  }
}

export { auth, storage };
export default app;
