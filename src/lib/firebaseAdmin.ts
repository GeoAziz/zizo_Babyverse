import admin from 'firebase-admin';

let app: admin.app.App;

try {
  if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    throw new Error('Missing Firebase Admin credentials');
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '';
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';

  const credential = admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  });

  // Use environment variables for production deployment
  app = admin.initializeApp({
    credential,
    projectId,
  });

} catch (error) {
  if (!admin.apps.length) {
    console.error('Firebase admin initialization error:', error);
    
    // Fallback initialization for development
    try {
      app = admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch (fallbackError) {
      console.error('Firebase admin fallback initialization failed:', fallbackError);
      throw fallbackError;
    }
  } else {
    app = admin.apps[0] as admin.app.App;
  }
}

if (!app && admin.apps.length > 0) {
  app = admin.apps[0] as admin.app.App;
}

export default admin;
export { app };
