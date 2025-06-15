
import type { DefaultSession, User as NextAuthUser } from 'next-auth';
import type { JWT as NextAuthJWT } from 'next-auth/jwt';
import type { Role } from '@prisma/client'; // Import your Role enum

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role; // Add your custom role property
    } & DefaultSession['user']; // Keep the default properties
  }

  interface User extends NextAuthUser {
    role: Role; // Add role to the User object returned by authorize
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends NextAuthJWT {
    id: string;
    role: Role; // Add role to the JWT token
  }
}
