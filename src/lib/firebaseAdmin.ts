import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON)
      : undefined;
        admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('Firebase Admin SDK initialized.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    throw error; // Re-throw to prevent app from starting with invalid Firebase config
  }
}

export default admin;
