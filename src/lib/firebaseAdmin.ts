import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON)
  : undefined;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : undefined, // Use ADC if no service account JSON
    });
    console.log('Firebase Admin SDK initialized.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

export default admin;