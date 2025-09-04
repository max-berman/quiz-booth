import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Missing Firebase configuration. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in your environment variables.');
  }

  try {
    // Handle the private key - Firebase expects the private key exactly as it appears in the JSON
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    // If the key is wrapped in quotes, remove them
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    
    // Replace escaped newlines with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    
    console.log('Firebase initialized successfully for project:', process.env.FIREBASE_PROJECT_ID);
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Please check that your FIREBASE_PRIVATE_KEY is the complete private key from your Firebase service account JSON, including the -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- lines.');
    throw error;
  }
}

export const db = getFirestore();
export const collections = {
  games: 'games',
  questions: 'questions',
  players: 'players',
} as const;