// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt'; // Import token retrieval from next-auth

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const token = await getToken({ req });

  // Define the guest routes that should not be accessible for logged-in users
  const guestRoutes: string[] = ['/login', '/register'];

  if (!token) {
    // User is not logged in
    if (!guestRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  } else {
    // User is logged in
    if (guestRoutes.includes(req.nextUrl.pathname)) {
      // If trying to access a guest route while logged in, redirect to home
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next(); // Proceed with the request for all other cases
}

// Apply middleware to all routes
export const config = {
  matcher: ['/', '/login', '/register', '/chat', '/chat/:path*'], // Add any other routes that require protection
};
