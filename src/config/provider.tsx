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
    // Check if user is authenticated (has access token)
    const hasAccessToken = document.cookie.includes('flashAccessToken')
    if (hasAccessToken) {
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
