// Skip complex session handling for now - rely on middleware
import { redirect } from "next/navigation"

/**
 * Simplified auth check for pages that require 
 * additional server-side protection beyond middleware
 */
export function requireAuth() {
  // The actual auth check happens in middleware.ts
  // This function is just a placeholder for server components
  // that need to know they require authentication
  return true
} 