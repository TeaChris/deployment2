'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { ReactNode, useState, useEffect } from 'react'

import HydrationWrapper from './hydration'
import { initializeProactiveRefresh } from './token.refresh.manager'

type Props = {
  children: ReactNode
}

export default function Providers({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient())

  // Initialize proactive token refresh when the app loads
  useEffect(() => {
    // Check if user has valid access token
    const hasValidToken = () => {
      try {
        const value = `; ${document.cookie}`
        const parts = value.split('; flashAccessToken=')
        if (parts.length === 2) {
          const token = parts.pop()?.split(';').shift()
          if (token && /^[a-zA-Z0-9\-_.]+$/.test(token)) {
            // Decode token to check expiration
            const parts = token.split('.')
            if (parts.length === 3) {
              const payload = parts[1]
              const decoded = JSON.parse(atob(payload))
              const now = Date.now() / 1000
              return decoded.exp > now
            }
          }
        }
        return false
      } catch (error) {
        console.error('Error checking access token:', error)
        return false
      }
    }

    if (hasValidToken()) {
      initializeProactiveRefresh()
    }
  }, [])

  return (
    <HydrationWrapper>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster duration={8000} position={'top-center'} richColors />
      </QueryClientProvider>
    </HydrationWrapper>
  )
}
