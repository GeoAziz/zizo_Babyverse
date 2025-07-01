import type { DefaultSession, User as NextAuthUser } from 'next-auth';
import type { JWT as NextAuthJWT } from 'next-auth/jwt';

type Role = 'PARENT' | 'ADMIN'; // Define your Role string union

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