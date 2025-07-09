---
# Authentication in Babyverse

This document covers authentication for both developers and end users.

## Developer Documentation

### 1. Firebase Admin SDK (Server-side)

- **Environment Variables Required (Production):**
  - `FIREBASE_ADMIN_PROJECT_ID`
  - `FIREBASE_ADMIN_CLIENT_EMAIL`
  - `FIREBASE_ADMIN_PRIVATE_KEY` (no outer quotes, keep `\n` for newlines)
  - Optionally, `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` (full JSON string)

- **Initialization:**
  - The server initializes Firebase Admin using the above credentials.
  - If using `FIREBASE_SERVICE_ACCOUNT_KEY_JSON`, it should be a valid JSON string (no outer quotes).
  - For local development, these can be loaded from `.env`.
  - For Vercel/production, set these in the Vercel dashboard under Environment Variables.

### 2. NextAuth.js (User Authentication)

- Uses `NEXTAUTH_SECRET` and `NEXTAUTH_URL` for session management.
- OAuth providers (Google, etc.) require their own client IDs and secrets.
- User roles (e.g., `ADMIN`) are checked in API routes for authorization.

### 3. Firestore Usage

- When creating or updating documents, you can use either `new Date()` (JS date) or Firestore's `FieldValue.serverTimestamp()` for timestamps.
- To use Firestore's server timestamp, import it from `firebase-admin`:
  ```js
  import { FieldValue } from 'firebase-admin/firestore';
  ...
  createdAt: FieldValue.serverTimestamp(),
  ```

## End User Documentation

- Users sign in via the frontend using supported providers (Google, email, etc.).
- User sessions are managed by NextAuth.js.
- Only users with the `ADMIN` role can access certain API endpoints (e.g., product creation).
- If you see an "Unauthorized" error, you may not have the required role or your session may have expired.

## Troubleshooting

- **Missing Firebase Admin ENV Vars:** Ensure all required variables are set in production.
- **Private Key Format:** Do not include outer quotes. Use `\n` for newlines or paste as a real multiline value in Vercel.
- **Session Issues:** Check that `NEXTAUTH_SECRET` and provider credentials are set.

---
