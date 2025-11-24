/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number // Maximum number of requests
  windowMs: number // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 15 * 60 * 1000 }
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(identifier, newEntry)

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: newEntry.resetTime,
    }
  }

  // Increment count
  entry.count++

  if (entry.count > config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  }
}

/**
 * Get rate limit identifier from request
 * Uses IP address or user ID if authenticated
 */
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }

  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return `ip:${realIp}`
  }

  // Fallback to a generic identifier
  return 'ip:unknown'
}

/**
 * Preset rate limit configurations
 */
export const rateLimitPresets = {
  // Strict limit for authentication endpoints
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // Standard limit for most API endpoints
  api: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // Generous limit for read operations
  read: {
    maxRequests: 200,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // Stricter limit for write operations
  write: {
    maxRequests: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // Very strict limit for file uploads
  upload: {
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
}
