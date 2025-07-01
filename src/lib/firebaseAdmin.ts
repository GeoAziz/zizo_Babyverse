import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

let serviceAccount: any;

// Always resolve from the project root
const keyPath = path.resolve(process.cwd(), 'serviceaccountkey.json');
if (fs.existsSync(keyPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
} else {
  throw new Error('serviceaccountkey.json not found in project root');
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      storageBucket: `${serviceAccount.project_id}.appspot.com`
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error?.message || error);
    throw error; // Re-throw to prevent app from starting with invalid Firebase config
  }
}

export default admin;
