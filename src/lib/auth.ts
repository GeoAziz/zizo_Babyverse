
import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
import type { Role } from '@prisma/client';
import admin from '@/lib/firebaseAdmin'; // Ensure this path is correct

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        try {
          // Google's 'sub' is a unique identifier for the user.
          const user = await prisma.user.upsert({
            where: { email: profile.email },
            update: {
              name: profile.name,
              image: profile.picture,
              firebaseUid: profile.sub, // Use Google's 'sub' as firebaseUid
              emailVerified: profile.email_verified ? new Date() : null,
            },
            create: {
              email: profile.email!,
              name: profile.name,
              image: profile.picture,
              emailVerified: profile.email_verified ? new Date() : null,
              firebaseUid: profile.sub,
              role: 'PARENT',
            },
          });
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            firebaseUid: user.firebaseUid,
          };
        } catch (error) {
          console.error("Error in Google provider profile callback:", error);
          // It's better to throw an error that NextAuth can catch and display
          // or log, rather than returning a potentially malformed object or null.
          throw new Error("Failed to process Google profile.");
        }
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        idToken: { label: "ID Token", type: "text" },
        authType: { label: "Auth Type", type: "text" }, // Should be 'FIREBASE_EMAIL'
        name: { label: "Name", type: "text" }, // For initial user creation in Prisma
      },
      async authorize(credentials) {
        if (credentials?.authType === 'FIREBASE_EMAIL' && credentials.idToken) {
          try {
            const decodedToken = await admin.auth().verifyIdToken(credentials.idToken);
            const firebaseUid = decodedToken.uid;
            const email = decodedToken.email;

            if (!email) {
              console.error("No email in Firebase token for UID:", firebaseUid);
              throw new Error("Email missing from Firebase token.");
            }

            let user = await prisma.user.findUnique({
              where: { email: email },
            });

            if (!user) {
              // Create user if they don't exist
              user = await prisma.user.create({
                data: {
                  email: email,
                  name: credentials.name || decodedToken.name || email.split('@')[0], // Use provided name, then token name, then derive
                  firebaseUid: firebaseUid,
                  emailVerified: decodedToken.email_verified ? new Date() : null,
                  image: decodedToken.picture || null, // Add image from token if available
                  role: 'PARENT', // Default role
                },
              });
            } else if (!user.firebaseUid || user.firebaseUid !== firebaseUid) {
              // Link Firebase UID if user exists but not linked or different
              // Also update name/image if Firebase token has more recent/better info
              user = await prisma.user.update({
                where: { email: email },
                data: {
                  firebaseUid: firebaseUid,
                  ...(decodedToken.name && { name: decodedToken.name }),
                  ...(decodedToken.picture && { image: decodedToken.picture }),
                  ...(decodedToken.email_verified && !user.emailVerified && { emailVerified: new Date() }),
                },
              });
            }
            
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
              firebaseUid: user.firebaseUid,
            };
          } catch (error) {
            console.error("Firebase ID token verification failed in authorize:", error);
            // Propagate a generic error or a specific one if identifiable
            // For example, if token is invalid, Firebase admin SDK throws specific errors
            return null; // Returning null triggers a credentials sign-in error
          }
        }
        // If not FIREBASE_EMAIL or no idToken, this provider is not applicable
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // This callback is called whenever a JWT is created (i.e. on sign in)
      // or updated (i.e. whenever a session is accessed in the client).
      if (user) { // `user` object is only passed on initial sign-in
        token.id = user.id;
        token.role = (user as { role: Role }).role; // Cast to include custom 'role'
        token.firebaseUid = (user as { firebaseUid?: string }).firebaseUid;
        token.picture = user.image || token.picture; // Prefer user.image from DB, fallback to token.picture
      }
      
      // Special handling if sign-in was with Google provider via NextAuth
      // This ensures that even if the initial `user` object from Google provider's `profile` callback
      // was minimal, we enrich the token with full details from our DB.
      if (account?.provider === "google" && token.email) {
        // User should have been upserted in GoogleProvider.profile, now ensure token fields are aligned
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.firebaseUid = dbUser.firebaseUid; // This would be Google's 'sub'
          token.picture = dbUser.image || token.picture; // Ensure image from DB is preferred
          token.name = dbUser.name || token.name; // Ensure name from DB is preferred
        }
      }
      return token;
    },
    async session({ session, token }) {
      // This callback is called whenever a session is checked.
      // We assign properties from the token to the session object.
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as Role; // Add role to session user
        (session.user as any).firebaseUid = token.firebaseUid as string | undefined; // Add firebaseUid
        session.user.image = token.picture as string | undefined; // Ensure image is on session
        session.user.name = token.name as string | undefined; // Ensure name is on session
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/', // Redirect to home page after sign out
    error: '/login?error=AuthError', // Custom error page or redirect to login with error query
    // newUser: '/profile/setup' // Optional: if you want to redirect new users to a setup page
  } // No comma here if `pages` is the last property before the final `};`
  // You could add other NextAuth options here if needed, e.g.:
  // secret: process.env.NEXTAUTH_SECRET, // Already implicitly used by NextAuth, but can be explicit
  // debug: process.env.NODE_ENV === 'development',
};
