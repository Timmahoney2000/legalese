import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createOrGetUser } from './users';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        createOrGetUser(user.email);
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        const user = createOrGetUser(token.email);
        session.user = {
          ...session.user,
          id: user.id,
          plan: user.plan,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};