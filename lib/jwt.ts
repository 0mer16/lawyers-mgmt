import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-key-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  id: string
  email: string
  name: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Creates a JWT token with the provided payload
 */
export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    const token = await new SignJWT(payload as any)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Use jose's built-in time parser
      .sign(secret)

    console.log('[JWT] Token created successfully for user:', payload.email)
    return token
  } catch (error) {
    console.error('[JWT] Error creating token:', error)
    throw error
  }
}

/**
 * Verifies and decodes a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    
    // Validate that required fields exist
    if (!payload.id || !payload.email || !payload.name || !payload.role) {
      console.error('JWT payload missing required fields:', payload)
      return null
    }
    
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      iat: payload.iat,
      exp: payload.exp
    }
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Parse expiration string (e.g., '7d', '24h', '60m') to seconds
 */
function parseExpiration(expiration: string): number {
  const match = expiration.match(/^(\d+)([dhms])$/)
  if (!match) {
    // Default to 7 days if parsing fails
    return 7 * 24 * 60 * 60
  }

  const [, value, unit] = match
  const num = parseInt(value, 10)

  switch (unit) {
    case 'd':
      return num * 24 * 60 * 60
    case 'h':
      return num * 60 * 60
    case 'm':
      return num * 60
    case 's':
      return num
    default:
      return 7 * 24 * 60 * 60
  }
}
