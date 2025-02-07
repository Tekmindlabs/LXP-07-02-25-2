import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { DefaultJWT } from "next-auth/jwt";
import { DefaultRoles } from "@/utils/permissions";

interface CustomJWT extends DefaultJWT {
  roles: string[];
  permissions: string[];
}

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req }) as CustomJWT | null;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
    const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');
    const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
    const isTrpcRoute = req.nextUrl.pathname.startsWith('/api/trpc');
    const isPublicRoute = 
      req.nextUrl.pathname === '/' || 
      req.nextUrl.pathname.startsWith('/_next') ||
      isTrpcRoute ||
      isApiAuthRoute;

    console.log('Middleware - Request:', {
      path: req.nextUrl.pathname,
      isAuth,
      roles: token?.roles,
      isTrpcRoute,
    });

    // Always allow TRPC routes
    if (isTrpcRoute) {
      return NextResponse.next();
    }

    // Allow all public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check role-based access for dashboard routes
    if (isDashboardPage && isAuth) {
      const urlRole = req.nextUrl.pathname.split('/')[2]; // Get role from URL
      const userRole = token.roles?.[0];
      
      // Validate if urlRole is a valid role
      const isValidRole = Object.values(DefaultRoles).includes(urlRole as string);
      
      // If accessing a role-specific route that doesn't match user's role or is invalid
      if (urlRole && (urlRole !== userRole || !isValidRole)) {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url));
      }
      
      // If accessing /dashboard directly, redirect to role-specific dashboard
      if (req.nextUrl.pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url));
      }
    }

    // Redirect authenticated users away from auth pages
    if (isAuth && isAuthPage) {
      const role = token.roles?.[0] || DefaultRoles.STUDENT;
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    // Redirect unauthenticated users to sign in
    if (!isAuth && isDashboardPage) {
      const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url)
      );
    }

    // Allow access to auth pages for unauthenticated users
    if (!isAuth && isAuthPage) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
      const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
      const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
      const isTrpcRoute = req.nextUrl.pathname.startsWith('/api/trpc');
      const isPublicRoute = 
        req.nextUrl.pathname === '/' || 
        req.nextUrl.pathname.startsWith('/_next') ||
        isTrpcRoute ||
        isApiAuthRoute;

      // Always allow TRPC routes
      if (isTrpcRoute) return true;

      if (isPublicRoute || isAuthPage) return true;
      return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};