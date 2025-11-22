import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Create a response that deletes the auth cookie
    const response = NextResponse.json({ success: true })
    
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