
import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import admin from '@/lib/firebaseAdmin'; // Firebase Admin SDK

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        // profile contains user info from Google
        // Here, we find or create a user in our own database
        try {
          const user = await prisma.user.upsert({
            where: { email: profile.email },
            update: {
              name: profile.name,
              image: profile.picture,
              firebaseUid: profile.sub, // Google's sub is a good candidate for firebaseUid
            },
            create: {
              email: profile.email!,
              name: profile.name,
              image: profile.picture,
              emailVerified: profile.email_verified ? new Date() : null,
              firebaseUid: profile.sub, // Store Google's unique ID
              role: 'PARENT', // Default role
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
          throw new Error("Failed to process Google profile.");
        }
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        // We will pass idToken for Firebase auth, or email/password for old system (if any part still uses it)
        idToken: { label: "ID Token", type: "text" },
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" },
        authType: { label: "Auth Type", type: "text" }, // 'FIREBASE_EMAIL' or 'LEGACY'
        name: { label: "Name", type: "text" }, // For initial signup with Firebase email/pass
      },
      async authorize(credentials) {
        if (credentials?.authType === 'FIREBASE_EMAIL' && credentials.idToken) {
          // Firebase Email/Password authentication
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
              // Create user if they don't exist (e.g., first sign-in via Firebase email/pass)
              user = await prisma.user.create({
                data: {
                  email: email,
                  name: credentials.name || decodedToken.name || email.split('@')[0], // Use name from creds, token, or derive from email
                  firebaseUid: firebaseUid,
                  emailVerified: decodedToken.email_verified ? new Date() : null,
                  role: 'PARENT',
                },
              });
            } else if (!user.firebaseUid) {
              // Link Firebase UID if user exists but not linked
              user = await prisma.user.update({
                where: { email: email },
                data: { firebaseUid: firebaseUid },
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
            console.error("Firebase ID token verification failed:", error);
            return null;
          }
        } else if (credentials?.email && credentials.password && (!credentials.authType || credentials.authType === 'LEGACY')) {
          // Legacy email/password (if you want to keep it)
          // For a full Firebase migration, you might remove this part eventually.
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.passwordHash) {
            return null;
          }
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isPasswordValid) {
            return null;
          }
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            image: user.image,
            role: user.role,
            firebaseUid: user.firebaseUid 
          };
        }
        return null; // No valid credentials path taken
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) { // User object from authorize or Google profile
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.firebaseUid = (user as { firebaseUid?: string }).firebaseUid;
        token.picture = user.image || token.picture; // Use image from DB or Google
      }
      // If it's a Google sign-in, account will be present
      // We can ensure firebaseUid is set from Google's `profile.sub` if not already
      if (account?.provider === "google" && user) {
        const dbUser = await prisma.user.findUnique({where: {id: user.id}});
        if (dbUser?.firebaseUid) {
            token.firebaseUid = dbUser.firebaseUid;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as Role; 
        (session.user as any).firebaseUid = token.firebaseUid as string | undefined;
        // session.user.image = token.picture as string | null; // Already handled by default session
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/', 
    error: '/login?error=AuthError', 