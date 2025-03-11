import type { Metadata } from 'next'
import './globals.css'
import { LayoutContent } from '../components/LayoutContent'

export const metadata: Metadata = {
  title: 'Reqmaster Spider',
  description: 'Your application description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}