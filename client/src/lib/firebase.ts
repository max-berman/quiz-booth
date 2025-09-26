import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

console.log('🚀 Firebase configuration loading...');

// Vite environment variables - check if they're available
console.log('Environment mode:', import.meta.env.MODE);
console.log('Development mode:', import.meta.env.DEV);
console.log('Production mode:', import.meta.env.PROD);

// Check if we're in development mode (Vite's way)
const isDevelopment = import.meta.env.DEV;

let app: any;
let auth: any;

if (isDevelopment) {
  console.log('🔥 Using Firebase emulator mode for development');

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
    console.log('📝 Initializing Firebase with emulator config...');
    app = initializeApp(firebaseConfig);
    console.log('📝 Getting auth instance...');
    auth = getAuth(app);

    // Set emulator settings IMMEDIATELY after getting auth
    console.log('📝 Setting up emulator connection...');
    auth.settings.appVerificationDisabledForTesting = true;

    // Connect to emulator IMMEDIATELY - no delay
    try {
      connectAuthEmulator(auth, 'http://localhost:9099', {
        disableWarnings: true
      });
      console.log('✅ Firebase Auth emulator connected successfully');

      // Connect Functions emulator
      const functions = getFunctions(app);
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log('✅ Firebase Functions emulator connected successfully');
    } catch (emulatorError) {
      console.error('❌ Emulator connection failed:', emulatorError);
    }

    // Set proper persistence to maintain user session across page refreshes
    // Use browserLocalPersistence for production-like behavior
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Failed to set persistence:', error);
    });

    console.log('✅ Firebase emulator setup completed');
  } catch (error) {
    console.error('❌ Firebase emulator setup failed:', error);
    // Fallback to empty app
    app = initializeApp({});
    auth = getAuth(app);
  }
} else {
  console.log('🔥 Using production Firebase configuration');

  // Production configuration - use actual environment variables
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'production-api-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'quiz-booth-production.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'quiz-booth-production',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'quiz-booth-production.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:684897101068:web:c9c501183d22f74d2cd529',
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Set proper persistence for production
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Failed to set persistence:', error);
  });

  console.log('✅ Production Firebase setup completed');
}

export { auth };
export default app;
