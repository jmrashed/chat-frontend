import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials: any, req): Promise<any> {
        try {          
          const res = await fetch(`${process.env.API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email, // Optional chaining to avoid undefined error
              password: credentials?.password,
            }),
          });
          const result = await res.json();

          // Check if the response indicates success and contains user data
          if (res.ok && result.status === "success") {
            const user = result.data; // Assuming result.data matches the AuthUser interface
            return user; // Return the user object
          }         

          throw new Error("Authentication error");
        } catch (error: any) {
          throw new Error(error.message);
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
