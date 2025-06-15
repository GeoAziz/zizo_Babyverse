import type { DefaultSession, User as NextAuthUser } from 'next-auth';
import type { JWT as NextAuthJWT } from 'next-auth/jwt';
import type { Role } from '@prisma/client'; // Import your Role enum

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      firebaseUid?: string; // Added firebaseUid
    } & DefaultSession['user']; 
  }

  interface User extends NextAuthUser {
    role: Role;
    firebaseUid?: string; // Added firebaseUid
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends NextAuthJWT {
    id: string;
    role: Role;
    firebaseUid?: string; // Added firebaseUid
  }
}