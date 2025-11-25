import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware for JWT-based authentication with role-based access control
 *
 * This middleware runs on every request to protected routes and:
 * 1. Validates JWT tokens from cookies
 * 2. Redirects unauthenticated users to login
 * 3. Redirects authenticated users away from auth pages
 * 4. Enforces role-based access control
 * 5. Preserves intended destination with redirect parameter
 */

// Routes that don't require authentication
const publicRoutes = ["/", "/forgot-password"];

// Auth routes that should redirect based on role if already logged in
const authRoutes = ["/login", "/register"];

// Role-based route access
const roleRoutes = {
  admin: [
    "/dashboard",
    "/profile",
    "/schools",
    "/students",
    "/enrol-officer",
    "/enter-grades",
  ],
  "grade-entry-officer": ["/enter-grades"],
} as const;

/**
 * Get default redirect path based on user role
 */
function getRoleDefaultPath(role: string): string {
  if (role === "grade-entry-officer") {
    return "/enter-grades";
  }
  return "/dashboard";
}

/**
 * Check if user has access to a specific path based on their role
 */
function hasRoleAccess(role: string, pathname: string): boolean {
  // Admin has access to all routes
  if (role === "admin") {
    return true;
  }

  // Check if grade-entry-officer has access
  if (role === "grade-entry-officer") {
    return roleRoutes["grade-entry-officer"].some((route) =>
      pathname.startsWith(route)
    );
  }

  return false;
}

/**
 * Basic JWT token validation
 * Checks if token exists and is not expired
 */
function isValidToken(token: string | undefined): boolean {
  if (!token) return false;

  try {
    // Split JWT token into parts
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decode payload (base64)
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );

    // Check expiration
    if (payload.exp) {
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // Token expired if current time is past expiry (with 60s buffer)
      if (now >= expiryTime - 60000) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication data from cookies
  const accessToken = request.cookies.get("asubeb_access_token")?.value;
  const refreshToken = request.cookies.get("asubeb_refresh_token")?.value;
  const userRole = request.cookies.get("asubeb_user_role")?.value;

  // Check if current route is public or auth route
  const isPublicRoute = publicRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Validate the access token
  const hasValidToken = isValidToken(accessToken);

  // Scenario 1: User trying to access protected route without valid token
  if (!hasValidToken && !isPublicRoute && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);

    // Preserve the intended destination
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  // Scenario 2: Authenticated user trying to access auth pages (login/register)
  if (hasValidToken && isAuthRoute) {
    // Check if there's a redirect parameter
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const defaultPath = getRoleDefaultPath(userRole || "admin");
    const redirectUrl = new URL(redirectParam || defaultPath, request.url);

    return NextResponse.redirect(redirectUrl);
  }

  // Scenario 3: Authenticated user trying to access route they don't have permission for
  if (hasValidToken && userRole && !isPublicRoute && !isAuthRoute) {
    if (!hasRoleAccess(userRole, pathname)) {
      // Redirect to their default page based on role
      const defaultPath = getRoleDefaultPath(userRole);
      const redirectUrl = new URL(defaultPath, request.url);

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Scenario 4: Token expired but refresh token exists
  if (!hasValidToken && refreshToken && !isPublicRoute && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(loginUrl);
  }

  // All checks passed, allow request to continue
  return NextResponse.next();
} // Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (they have their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api).*)",
  ],
};
