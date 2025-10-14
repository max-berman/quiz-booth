import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import clientEnvironment from '../config/environment';

let app: any;
let auth: any;
let db: any;
let storage: any;

// Check if Firebase is already initialized
const existingApps = getApps();
if (existingApps.length > 0) {
  app = existingApps[0];
  auth = getAuth(app);
} else {
  const config = clientEnvironment.getConfig();

  // Validate Firebase configuration
  if (!clientEnvironment.validateFirebaseConfig()) {
    throw new Error('Invalid Firebase configuration');
  }

  try {
    app = initializeApp(config.firebase.config);
    auth = getAuth(app);
    db = getFirestore(app);

    if (clientEnvironment.isDevelopment()) {
      // Set emulator settings IMMEDIATELY after getting auth
      auth.settings.appVerificationDisabledForTesting = true;

      // Connect to emulator IMMEDIATELY - no delay
      try {
        connectAuthEmulator(auth, config.firebase.emulator.auth, {
          disableWarnings: true
        });

        // Connect Firestore emulator
        connectFirestoreEmulator(db, 'localhost', 8081);

        // Connect Functions emulator
        const functions = getFunctions(app);
        connectFunctionsEmulator(functions, 'localhost', 5001);

        // Connect Storage emulator
        storage = getStorage(app);
        connectStorageEmulator(storage, 'localhost', 9199);
      } catch (emulatorError) {
        console.error('Emulator connection failed:', emulatorError);
      }
    } else {
      // Production - initialize storage without emulator
      storage = getStorage(app);
    }

    // Set proper persistence to maintain user session across page refreshes
    // Use browserLocalPersistence for production-like behavior
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Failed to set persistence:', error);
    });

    console.log(`Firebase initialized for ${config.environment} environment`);
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error; // Let the error propagate so we can see what's wrong
  }
}

export { auth, db, storage };
export default app;
