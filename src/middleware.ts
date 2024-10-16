import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(request) {
    const authenticatedData = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isGuestRoute = guestRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (!authenticatedData && !isGuestRoute) {
      const redirectUrl = new URL("/login", request.url);
      const baseURL = process.env.NEXTAUTH_URL;
      const pathname = request.nextUrl.pathname;
      const callbackUrl = new URL(pathname, baseURL);
      redirectUrl.searchParams.set("callbackUrl", callbackUrl.href);
      return NextResponse.redirect(redirectUrl);
    }

    if (authenticatedData) {
      if (isGuestRoute) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  },
  {
    callbacks: {
      async authorized(token) {
        console.log(token)
        return true;
      },
    },
  }
);

const guestRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/language/update",
];
