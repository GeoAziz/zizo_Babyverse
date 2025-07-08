


import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Singleton pattern for admin app
let app;

// Helper to parse private key correctly
function parsePrivateKey(key: string | undefined) {
  if (!key) return undefined;
  // Handles both escaped and real newlines
  return key.replace(/\\n/g, '\n').replace(/\r\n|\r|\n/g, '\n');
}

if (!getApps().length) {
  try {
    console.log('DEBUG: Firebase Admin ENV VARS:', {
      SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      ADMIN_PRIVATE_KEY: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      ADMIN_PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = parsePrivateKey(serviceAccount.private_key);
      }
      console.log('DEBUG: Using FIREBASE_SERVICE_ACCOUNT_KEY for Firebase Admin init');
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else if (
      process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PROJECT_ID
    ) {
      console.log('DEBUG: Using individual FIREBASE_ADMIN_* vars for Firebase Admin init');
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: parsePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
        }),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
    } else {
      console.error('DEBUG: Missing Firebase Admin credentials. Vars:', {
        SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
      throw new Error('Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY or all of FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PROJECT_ID.');
    }
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase admin initialization error:', error);
    throw error;
  }
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
export default { app, db, auth };
