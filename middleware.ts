import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Validate our token function (simplified)
function isValidToken(token: string): boolean {
  try {
    // The token is already in base64 format, but the payload is in the format: header.payload.signature
    // We need to extract the payload (index 1) and then decode it
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Invalid token format:', token)
      return false
    }
    
    const payload = parts[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())
    
    // Check if token has required fields
    if (!decoded || !decoded.id) {
      console.error('Missing required fields in token')
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error validating token:', error)
    return false
  }
}

// Simplified middleware that only protects specific paths
export function middleware(request: NextRequest) {
  // Get the path
  const path = request.nextUrl.pathname
  
  // Skip auth paths and static files completely
  if (path.startsWith('/api/auth') || 
      path.startsWith('/_next') || 
      path.includes('favicon.ico') ||
      path === '/signin') {
    return NextResponse.next()
  }
  
  // Check for our auth token
  const authToken = request.cookies.get('auth-token')?.value
  
  // Debug auth token
  console.log(`Path: ${path}, Token exists: ${!!authToken}`)
  
  const isAuthenticated = authToken && isValidToken(authToken)
  
  // Debug authentication result
  console.log(`Path: ${path}, Authenticated: ${isAuthenticated}`)
  
  // If not authenticated and not visiting the home page, redirect to signin
  if (!isAuthenticated && path !== '/') {
    console.log(`Redirecting to signin from: ${path}`)
    return NextResponse.redirect(new URL('/signin', request.url))
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