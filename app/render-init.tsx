'use client'

import { useEffect, useState } from 'react'
import LoadingScreen from './loading-screen'

export default function RenderInit({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Ensure critical resources are loaded
    const initApp = async () => {
      try {
        // Wait for DOM to be fully ready
        if (document.readyState === 'loading') {
          await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve)
          })
        }

        // Give a small delay for Render's initial load
        await new Promise(resolve => setTimeout(resolve, 300))

        // Mark as ready
        setIsReady(true)
      } catch (error) {
        console.error('Init error:', error)
        // Even on error, show the app
        setIsReady(true)
      }
    }

    initApp()
  }, [])

  if (!isReady) {
    return <LoadingScreen />
  }

  return <>{children}</>
}
