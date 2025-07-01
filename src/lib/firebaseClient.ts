import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signOut as firebaseSignOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

// If you want to use the Firebase Auth Emulator for local development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  // Point to the emulators. Ensure your emulators are running.
  // By default, the auth emulator runs on http://127.0.0.1:9099
  // The connectAuthEmulator function takes the auth instance and the URL of the emulator.
  // Make sure this URL matches your firebase.json emulator configuration.
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    console.log("Firebase Auth Emulator connected successfully.");
  } catch (error) {
    console.error("Failed to connect Firebase Auth Emulator:", error);
  }
}

export { app, auth, firebaseSignOut };
