import { NextResponse } from 'next/server'

/**
 * Standard API response helpers
 */

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function createdResponse<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

export function noContentResponse() {
  return new NextResponse(null, { status: 204 })
}

export function errorResponse(message: string, status: number = 500, details?: any) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
    },
    { status }
  )
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse(message, 403)
}

export function notFoundResponse(resource: string = 'Resource') {
  return errorResponse(`${resource} not found`, 404)
}

export function badRequestResponse(message: string, details?: any) {
  return errorResponse(message, 400, details)
}

export function conflictResponse(message: string = 'Resource already exists') {
  return errorResponse(message, 409)
}

export function validationErrorResponse(errors: any[]) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      errors,
    },
    { status: 422 }
  )
}

export function rateLimitResponse(resetTime: number) {
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Please try again later',
      resetTime,
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  )
}

/**
 * Add standard headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CORS headers (adjust as needed for your production domain)
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigin = process.env.NEXTAUTH_URL || process.env.APP_URL
    if (allowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    }
  }
  
  return response
}

/**
 * Wrapper to add security headers to all responses
 */
export function secureResponse<T>(data: T, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status })
  return addSecurityHeaders(response)
}
