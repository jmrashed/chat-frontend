import NextAuth from "next-auth/next";
import { authOptions } from "../../../../../config/nextAuthConfig";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
