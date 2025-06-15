
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
              role: 'PARENT', // Default role for Google sign-ups
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
        name: { label: "Name", type: "text" }, // For initial user creation in Prisma if signing up
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
              // User signed up via Firebase email/password, create them in Prisma
              user = await prisma.user.create({
                data: {
                  email: email,
                  name: credentials.name || decodedToken.name || email.split('@')[0],
                  firebaseUid: firebaseUid,
                  emailVerified: decodedToken.email_verified ? new Date() : null,
                  image: decodedToken.picture || null,
                  role: 'PARENT', // Default role
                },
              });
            } else if (!user.firebaseUid || user.firebaseUid !== firebaseUid) {
              // User exists, link Firebase UID and update info if necessary
              user = await prisma.user.update({
                where: { email: email },
                data: {
                  firebaseUid: firebaseUid,
                  ...(decodedToken.name && !user.name && { name: decodedToken.name }), // Only update if Prisma name is missing
                  ...(decodedToken.picture && !user.image && { image: decodedToken.picture }), // Only update if Prisma image is missing
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
            console.error("Firebase ID token verification/user sync failed in authorize:", error);
            return null; 
          }
        }
        return null;
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
        token.name = user.name || token.name;
      }
      
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.firebaseUid = dbUser.firebaseUid; 
          token.picture = dbUser.image || token.picture;
          token.name = dbUser.name || token.name; 
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
        session.user.name = token.name as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login?error=AuthError' // No trailing comma here
    // newUser: '/profile/setup' // Optional: if you want to redirect new users to a setup page
  } // This closes the pages object. No comma after this if secret/debug are commented.
  // secret: process.env.NEXTAUTH_SECRET, // Already implicitly used by NextAuth, but can be explicit
  // debug: process.env.NODE_ENV === 'development',
}; // This closes the authOptions object and ends the statement.

    