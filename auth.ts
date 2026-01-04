import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { createOrGetUser } from './lib/users';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        createOrGetUser(user.email);
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        const userRecord = createOrGetUser(token.email);
        session.user = {
          ...session.user,
          id: userRecord.id,
          plan: userRecord.plan,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
});
