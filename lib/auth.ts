// Server-side authentication utilities
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'

// Server-side auth check - returns session if logged in, null otherwise
export async function auth() {
  // Get the cookie after awaiting cookies()
  const cookiesStore = await cookies();
  const token = cookiesStore.get('auth-token')?.value
  
  if (!token) {
    return null
  }

  try {
    // Verify and decode JWT token
    const decoded = await verifyToken(token)
    
    if (!decoded || !decoded.id) {
      console.error('Invalid token format:', decoded)
      return null
    }
    
    // Fetch user from database to confirm they exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    if (!user) {
      console.error('User not found for token ID:', decoded.id)
      return null
    }
    
    // Return session
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

// Utility function for pages that require authentication
export async function requireAuth() {
  const session = await auth()
  
  if (!session) {
    redirect('/signin')
  }
  
  return session
} 