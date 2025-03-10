'use client'

import { AuthProvider } from '@/app/context/auth'
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Navigation from '@/components/Navigation'
import { usePathname } from 'next/navigation'
import { Toaster } from 'sonner'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="relative flex min-h-screen flex-col">
      <Toaster position="top-center" />
      <AuthProvider>
        <ProtectedRoute>
          <Navigation />
          <main className={`${pathname === '/login' ? '' : 'mt-16'}`}>
            {children}
          </main>
        </ProtectedRoute>
      </AuthProvider>
    </div>
  )
} 