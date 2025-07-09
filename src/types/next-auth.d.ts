import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      organizationId?: string;
    } & DefaultSession['user'];
  }

  interface JWT {
    userId: string;
    email: string;
    name: string;
    role: string;
    organizationId?: string;
  }
}