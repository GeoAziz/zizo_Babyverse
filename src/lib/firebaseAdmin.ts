import * as admin from 'firebase-admin';

// Attempt to parse the service account key from an environment variable
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', error);
    // Fallback or error handling strategy if JSON is malformed
  }
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // Use parsed service account if available, otherwise rely on Application Default Credentials
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault(),
    });
    console.log('Firebase Admin SDK initialized.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    // More specific error handling can be added here
    // For example, if ADC are not found and no service account was provided.
  }
}

export default admin;
