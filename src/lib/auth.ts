import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
import type { Role } from '@prisma/client';
import admin from '@/lib/firebaseAdmin';

// Extend the NextAuth User type to include our custom fields
interface User extends NextAuthUser {
  id: string;
  role: Role;
  firebaseUid?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.email?.split('@')[0] ?? 'Unknown',
          email: profile.email ?? '',
          image: profile.picture ?? null,
          role: 'PARENT' as const,
          firebaseUid: profile.sub
        };
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        idToken: { label: "ID Token", type: "text" },
        authType: { label: "Auth Type", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.idToken || !credentials?.authType) {
          console.error("Missing required credentials");
          return null;
        }

        try {
          const decodedToken = await admin.auth().verifyIdToken(credentials.idToken);
          const { uid: firebaseUid, email, email_verified, name: firebaseName, picture } = decodedToken;

          if (!email) {
            console.error("No email in Firebase token for UID:", firebaseUid);
            return null;
          }

          // Check for admin email
          const isAdmin = email === 'admin@babyverse.com';

          const user = await prisma.user.upsert({
            where: { email },
            update: {
              firebaseUid,
              ...(credentials.name && { name: credentials.name }),
              ...(firebaseName && { name: firebaseName }),
              ...(picture && { image: picture }),
              ...(email_verified && { emailVerified: new Date() }),
              ...(isAdmin && { role: 'ADMIN' })
            },
            create: {
              email,
              name: credentials.name || firebaseName || email.split('@')[0],
              firebaseUid,
              emailVerified: email_verified ? new Date() : null,
              image: picture || null,
              role: isAdmin ? 'ADMIN' : 'PARENT',
            },
          });

          return {
            id: user.id,
            name: user.name || undefined,
            email: user.email,
            image: user.image || undefined,
            role: user.role,
            firebaseUid: user.firebaseUid || undefined,
          };
        } catch (error) {
          console.error("Firebase/DB error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as User).role;
        token.firebaseUid = (user as User).firebaseUid;
      }
      
      if (account?.provider === "google" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({ 
            where: { email: token.email }
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.firebaseUid = dbUser.firebaseUid || undefined;
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as User).role = token.role as Role;
        (session.user as User).firebaseUid = token.firebaseUid as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login?error=AuthError'
  }
};
