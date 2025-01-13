// hooks/usePersonioAuth.ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function usePersonioAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null
  })
  const router = useRouter()

  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const response = await fetch('/api/auth/personio', {
        method: 'POST',
        credentials: 'include', // Important for cookies
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      })
    }
  }

  const logout = async () => {
    // Clear cookies through API
    await fetch('/api/auth/personio/logout', {
      method: 'POST',
      credentials: 'include',
    })

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      error: null
    })

    router.push('/login') // Or wherever you want to redirect
  }

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/personio/check', {
          credentials: 'include',
        })

        setAuthState({
          isAuthenticated: response.ok,
          isLoading: false,
          error: null
        })
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to check authentication status'
        })
      }
    }

    checkAuth()
  }, [])

  return {
    ...authState,
    login,
    logout
  }
}