import type { Metadata } from 'next'
import {  User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import './globals.css';
import Navigation from '@/components/Navigation'
import { AuthProvider } from './context/auth'

export const metadata: Metadata = {
  title: 'Reqmaster Spider',
  description: 'Your application description',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <AuthProvider>
          <Navigation />
          <main className="mt-16">
            {children}
          </main>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}