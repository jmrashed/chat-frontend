import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials: any, req): Promise<any> {
        try {
          console.log('NextAuth authorize called with:', { email: credentials?.email });
          
          const res = await fetch(`${process.env.API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });
          
          const result = await res.json();
          console.log('Backend response:', { status: res.status, result });

          if (res.ok && result.status === "success") {
            return {
              id: result.data.id,
              email: result.data.email,
              username: result.data.username,
              accessToken: result.data.accessToken
            };
          }

          console.log('Authentication failed:', result);
          return null;
        } catch (error: any) {
          console.error('NextAuth authorize error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // Customize sign-in page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken; // Add access token from your API
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken; // Add access token to session
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in your environment variables
};
