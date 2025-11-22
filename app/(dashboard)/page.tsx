import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/session"

// Re-export the dashboard page component from the root app directory
export { default } from "@/app/(dashboard)/dashboard/page"

// We need this function to handle authentication
export async function generateMetadata() {
  // Authentication is now handled by middleware
  return {
    title: "Dashboard - Pakistan Legal Manager",
  }
} 