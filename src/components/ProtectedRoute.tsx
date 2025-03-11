// components/ProtectedRoute.tsx
"use client"

import { useAuth } from "../app/context/auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

const publicPaths = ['/', '/login']

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isAuthenticated && !publicPaths.includes(pathname)) {
      toast.error('Please login to continue', {
        description: 'This page requires authentication',
      })
      router.push('/login')
    }
  }, [isAuthenticated, loading, router, pathname])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    return null
  }

  return <>{children}</>
}