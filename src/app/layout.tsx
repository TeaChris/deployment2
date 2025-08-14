import type { Metadata } from 'next'
import { Comfortaa } from 'next/font/google'

import './globals.css'
import { cn } from '@/utils'
import { Navbar } from '@/components'
import Providers from '@/config/provider'
import { TokenRefreshStatus } from '@/components'

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-comfortaa',
})

// create a custom metadata later
export const metadata: Metadata = {
  title: 'Flash!',
  description: 'A secure and modern web application',
  keywords: ['security', 'modern', 'web', 'application'],
  authors: [{ name: 'Boluwatife Olasunkanmi' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Remove in production
  other: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        'bg-white text-slate-900 antialiased light',
        comfortaa.className
      )}
    >
      <body
        className="min-h-screen bg-slate-50 antialiased w-full overflow-x-hidden"
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="container max-w-7xl mx-auto h-full pt-12">
            {children}
          </main>
          {process.env.NODE_ENV === 'development' && <TokenRefreshStatus />}
        </Providers>
      </body>
    </html>
  )
}
