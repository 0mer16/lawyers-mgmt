import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

// Validate our token function
async function isValidToken(token: string): Promise<boolean> {
  try {
    const decoded = await verifyToken(token)
    if (!decoded) {
      console.error('[Middleware] Token verification returned null')
      return false
    }
    console.log('[Middleware] Token verified successfully for user:', decoded.email)
    return true
  } catch (error) {
    console.error('[Middleware] Error validating token:', error)
    return false
  }
}

// Simplified middleware that only protects specific paths
export async function middleware(request: NextRequest) {
  // Get the path
  const path = request.nextUrl.pathname
  
  // Skip auth paths and static files completely
  if (path.startsWith('/api/auth') || 
      path.startsWith('/_next') || 
      path.includes('favicon.ico') ||
      path.startsWith('/public') ||
      path === '/signin' ||
      path === '/signup') {
    return NextResponse.next()
  }
  
  // Check for our auth token
  const authToken = request.cookies.get('auth-token')?.value
  
  console.log(`[Middleware] Path: ${path}, Token exists: ${!!authToken}`)
  
  if (!authToken) {
    console.log('[Middleware] No token found, redirecting to signin')
    if (path !== '/' && !path.startsWith('/signin') && !path.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
    return NextResponse.next()
  }
  
  const isAuthenticated = await isValidToken(authToken)
  console.log(`[Middleware] Path: ${path}, Authenticated: ${isAuthenticated}`)
  
  // If not authenticated and trying to access protected routes
  if (!isAuthenticated && path !== '/' && !path.startsWith('/signin') && !path.startsWith('/signup')) {
    console.log('[Middleware] Invalid token, redirecting to signin')
    return NextResponse.redirect(new URL('/signin', request.url))
  }
  
  // If authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && (path === '/signin' || path === '/signup')) {
    console.log('[Middleware] Already authenticated, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones we don't want to protect
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)' 
  ],
} 