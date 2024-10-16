import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const guestRoutes = [
  "/login",
  "/register",
];

export default withAuth(
  async function middleware(request) {
    const authenticatedData = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isGuestRoute = guestRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    // If the user is not authenticated and not on a guest route, redirect to login
    if (!authenticatedData && !isGuestRoute) {
      const redirectUrl = new URL("/login", request.url);
      const baseURL = process.env.NEXTAUTH_URL;
      const pathname = request.nextUrl.pathname;
      const callbackUrl = new URL(pathname, baseURL);
      redirectUrl.searchParams.set("callbackUrl", callbackUrl.href);
      return NextResponse.redirect(redirectUrl);
    }

    // If the user is authenticated and trying to access guest routes, redirect to home
    if (authenticatedData && isGuestRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Continue to the requested route if authenticated and accessing protected routes
    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized(token) {
        // Add any additional authorization logic if necessary
        return !!token; // Ensure token exists
      },
    },
  }
);
