import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import admin from '@/lib/firebaseAdmin';

// Define the Role type for user roles
export type Role = 'ADMIN' | 'PARENT';

// Extend the NextAuth User type to include our custom fields
interface User extends NextAuthUser {
  id: string;
  role: Role;
  firebaseUid?: string;
}

export const db = admin.firestore();
export const auth = admin.auth();

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      },
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
          const decodedToken = await auth.verifyIdToken(credentials.idToken);
          const { uid: firebaseUid, email, email_verified, name: firebaseName, picture } = decodedToken;

          if (!email) {
            console.error("No email in Firebase token for UID:", firebaseUid);
            return null;
          }

          // Check for admin email
          const isAdmin = email === 'admin@babyverse.com';

          // Firestore user upsert logic
          const userRef = db.collection('users').doc(firebaseUid);
          const userSnap = await userRef.get();
          let userData: any;
          if (userSnap.exists) {
            await userRef.set({
              firebaseUid,
              ...(credentials.name && { name: credentials.name }),
              ...(firebaseName && { name: firebaseName }),
              ...(picture && { image: picture }),
              ...(email_verified && { emailVerified: new Date() }),
              ...(isAdmin && { role: 'ADMIN' })
            }, { merge: true });
            userData = { ...userSnap.data(), ...credentials, firebaseUid, role: isAdmin ? 'ADMIN' : 'PARENT' };
          } else {
            userData = {
              email,
              name: credentials.name || firebaseName || email.split('@')[0],
              firebaseUid,
              emailVerified: email_verified ? new Date() : null,
              image: picture || null,
              role: isAdmin ? 'ADMIN' : 'PARENT',
            };
            await userRef.set(userData);
          }

          return {
            id: firebaseUid,
            name: userData.name || undefined,
            email: userData.email,
            image: userData.image || undefined,
            role: userData.role,
            firebaseUid: userData.firebaseUid || undefined,
          };
        } catch (error) {
          console.error("Firebase/DB error in authorize:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id; // user.id is firebaseUid
        token.role = (user as User).role;
        token.firebaseUid = (user as User).firebaseUid;
      }
      // Optionally fetch user from Firestore for Google provider
      if (account?.provider === "google" && token.email) {
        try {
          const userSnap = await db.collection('users').where('email', '==', token.email).limit(1).get();
          if (!userSnap.empty) {
            const dbUser = userSnap.docs[0].data();
            token.id = dbUser.firebaseUid || dbUser.id;
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
        session.user.id = token.id as string; // id is firebaseUid
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
  },
  events: {
    async signIn({ user, account, profile }) {
      try {
        // Always create or update user in Firestore on sign-in
        if (user && user.id) {
          const userRef = db.collection('users').doc(user.id);
          await userRef.set({
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.email === 'admin@babyverse.com' ? 'ADMIN' : 'PARENT',
            firebaseUid: user.id,
            lastSignIn: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }
      } catch (error) {
        console.error('Error saving user to Firestore:', error);
        // Don't throw - allow sign in to continue
      }
    },
  },
};
