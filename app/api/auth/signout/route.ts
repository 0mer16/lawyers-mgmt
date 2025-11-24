import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create a response that deletes the auth cookie
    const response = NextResponse.json({ success: true, message: 'Signed out successfully' })
    
    // Delete the auth token cookie
    response.cookies.delete('auth-token')
    
    return response
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signout' },
      { status: 500 }
    )
  }
}

// Also support GET for simple signout links
export async function GET(request: NextRequest) {
  try {
    // Redirect to signin page and delete cookie
    const response = NextResponse.redirect(new URL('/signin', request.url))
    response.cookies.delete('auth-token')
    
    return response
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.redirect(new URL('/signin', request.url))
  }
} 