import { NextRequest, NextResponse } from 'next/server'

// Function to parse our JWT-like token
function parseToken(token: string): any {
  try {
    // Extract the payload (second part of the token)
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Invalid token format')
      return null
    }
    
    const payload = parts[1]
    const data = JSON.parse(Buffer.from(payload, 'base64').toString())
    
    // Check if token is expired
    if (data.exp && data.exp < Date.now()) {
      console.error('Token expired')
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error parsing token:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ user: null })
    }
    
    // Parse and validate token
    const userData = parseToken(token)
    
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