import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          console.log('Attempting login for:', credentials.email);

          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email))
            .limit(1);

          if (!user[0]) {
            console.log('User not found:', credentials.email);
            return null;
          }

          if (!user[0].isActive) {
            console.log('User inactive:', credentials.email);
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password,
            user[0].passwordHash
          );

          if (!isPasswordValid) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }

          console.log('Login successful for:', credentials.email);

          // Update last login
          await db
            .update(users)
            .set({ lastLogin: new Date() })
            .where(eq(users.id, user[0].id));

          return {
            id: user[0].id,
            email: user[0].email,
            name: `${user[0].firstName} ${user[0].lastName}`,
            role: user[0].role || 'user',
            organizationId: user[0].organizationId || undefined,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.userId as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          organizationId: token.organizationId as string,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};