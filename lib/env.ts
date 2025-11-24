/**
 * Environment variables validation and configuration
 * This ensures all required environment variables are present before the app starts
 */

const requiredEnvVars = [
  'DATABASE_URL',
] as const

const optionalEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'JWT_SECRET',
  'NODE_ENV',
] as const

type RequiredEnvVar = typeof requiredEnvVars[number]
type OptionalEnvVar = typeof optionalEnvVars[number]

interface EnvConfig {
  DATABASE_URL: string
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  JWT_SECRET: string
  NODE_ENV: 'development' | 'production' | 'test'
  MAX_FILE_SIZE_MB: number
  ALLOWED_FILE_TYPES: string[]
}

function validateEnv(): EnvConfig {
  const missing: string[] = []
  
  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please copy .env.example to .env and fill in the required values.'
    )
  }
  
  // Provide defaults for optional variables
  const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || generateFallbackSecret()
  const JWT_SECRET = process.env.JWT_SECRET || NEXTAUTH_SECRET
  const NODE_ENV = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test'
  const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 
    (NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000')
  
  // Warn about using fallback secrets in production
  if (NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
    console.warn('WARNING: Using fallback secret in production. Please set NEXTAUTH_SECRET in your environment.')
  }
  
  if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.warn('WARNING: Using fallback secret in production. Please set JWT_SECRET in your environment.')
  }
  
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NEXTAUTH_SECRET,
    NEXTAUTH_URL,
    JWT_SECRET,
    NODE_ENV,
    MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
    ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png').split(','),
  }
}

function generateFallbackSecret(): string {
  // Only for development - should never be used in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot generate fallback secret in production')
  }
  return 'dev-secret-' + Math.random().toString(36).substring(7)
}

// Validate and export configuration
export const env = validateEnv()

// Export individual values for convenience
export const {
  DATABASE_URL,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  JWT_SECRET,
  NODE_ENV,
  MAX_FILE_SIZE_MB,
  ALLOWED_FILE_TYPES,
} = env
