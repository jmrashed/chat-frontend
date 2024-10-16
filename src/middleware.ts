// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt'; // Import token retrieval from next-auth

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const token = await getToken({ req });

  // Define the guest routes that should not be accessible for logged-in users
  const guestRoutes: string[] = ['/login', '/register'];

  // Check if the user is trying to access a guest route while logged in
  if (token && guestRoutes.includes(req.nextUrl.pathname)) {
    // Redirect to the homepage or another route
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// Apply middleware to guest routes
export const config = {
  matcher: ['/login', '/register'], // Define which routes the middleware should apply to
};
