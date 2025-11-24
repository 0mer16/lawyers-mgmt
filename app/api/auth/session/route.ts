import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ user: null })
    }
    
    // Verify JWT token
    const userData = await verifyToken(token)
    
    if (!userData) {
      // Token is invalid or expired
      const response = NextResponse.json({ user: null })
      response.cookies.delete('auth-token')
      return response
    }
    
    // Return the user data
    return NextResponse.json({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      }
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null })
  }
} 