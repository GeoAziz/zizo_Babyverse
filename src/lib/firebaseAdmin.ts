


import { initializeApp, getApps, cert, App, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

// Try to use FIREBASE_SERVICE_ACCOUNT_KEY (stringified JSON) if available
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!getApps().length) {
  try {
    if (serviceAccountJson) {
      // Use the full service account JSON (preferred for serverless)
      const serviceAccount = JSON.parse(serviceAccountJson);
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else if (
      process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PROJECT_ID
    ) {
      // Use individual env vars (legacy)
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
    } else {
      throw new Error('Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY or all of FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PROJECT_ID.');
    }
    // eslint-disable-next-line no-console
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Firebase admin initialization error:', error);
    throw error;
  }
} else {
  app = getApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
