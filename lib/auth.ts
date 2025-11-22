// This file is no longer used
// We've moved the auth configuration to app/api/auth/[...nextauth]/route.ts 

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Function to parse our JWT-like token
function parseToken(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Invalid token format, missing parts')
      return null
    }
    
    const payload = parts[1]
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'))
    return data
  } catch (error) {
    console.error('Failed to parse token:', error)
    return null
  }
}

// Server-side auth check - returns session if logged in, null otherwise
export async function auth() {
  // Get the cookie after awaiting cookies()
  const cookiesStore = await cookies();
  const token = cookiesStore.get('auth-token')?.value
  
  if (!token) {
    return null
  }

  try {
    // Parse and validate token
    const decoded = parseToken(token)
    
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      console.error('Invalid token format:', decoded)
      return null
    }
    
    // Fetch user from database to confirm they exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.id as string },
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