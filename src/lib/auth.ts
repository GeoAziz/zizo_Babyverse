
import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
// import bcrypt from 'bcryptjs'; // bcrypt usage removed as Firebase handles passwords
import type { Role } from '@prisma/client';
import admin from '@/lib/firebaseAdmin';

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
                  name: credentials.name || decodedToken.name || email.split('@')[0],
                  firebaseUid: firebaseUid,
                  emailVerified: decodedToken.email_verified ? new Date() : null,
                  role: 'PARENT',
                },
              });
            } else if (!user.firebaseUid || user.firebaseUid !== firebaseUid) {
              // Link Firebase UID if user exists but not linked or different
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
            console.error("Firebase ID token verification failed:", error);
            return null;
          }
        }
        return null; // Only Firebase email/pass via idToken is supported here now
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) { 
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.firebaseUid = (user as { firebaseUid?: string }).firebaseUid;
        token.picture = user.image || token.picture;
      }
      
      // If sign-in was with Google via NextAuth GoogleProvider
      if (account?.provider === "google" && user?.email) {
        // User should have been upserted in GoogleProvider.profile, now ensure token fields are aligned
        const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.firebaseUid = dbUser.firebaseUid; // This would be Google's 'sub'
          token.picture = dbUser.image || token.picture;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as Role; 
        (session.user as any).firebaseUid = token.firebaseUid as string | undefined;
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/', 
    error: '/login?error=AuthError', 
  }, 
}; 
