// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/index';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    // Email/Password login
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email và mật khẩu là bắt buộc');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Email hoặc mật khẩu không đúng');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Email hoặc mật khẩu không đúng');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/', // Redirect to home, modal handles login
    error: '/',
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Allow OAuth sign in
      if (account?.provider === 'google') {
        // Check if user exists with this email
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        // If user exists but signed up with credentials, link accounts
        if (existingUser && !existingUser.password) {
          return true;
        }

        // If no user exists, create one (handled by adapter)
        return true;
      }

      // Allow credentials sign in
      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
