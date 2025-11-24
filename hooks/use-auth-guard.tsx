'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuthGuard(): AuthState {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (!response.ok) {
          router.push('/signin')
          return
        }
        
        const data = await response.json()
        if (!data.user) {
          router.push('/signin')
          return
        }
        
        setUser(data.user)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/signin')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/signin')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return { user, loading, signOut }
}

// Alias for compatibility with components using useAuth
export const useAuth = useAuthGuard 