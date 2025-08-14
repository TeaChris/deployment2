'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { ReactNode, useState, useEffect } from 'react'

import { initializeProactiveRefresh } from './token.refresh.manager'
import { useAuthStore } from '@/store'

type Props = {
  children: ReactNode
}

export default function Providers({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient())

  // Initialize proactive token refresh when the app loads
  useEffect(() => {
    console.log('Provider useEffect - Checking for valid token')
    // Check if user has valid access token
    const hasValidToken = () => {
      try {
        const value = `; ${document.cookie}`
        const parts = value.split('; flashAccessToken=')
        console.log('Provider - Cookie parts:', parts.length)
        if (parts.length === 2) {
          const token = parts.pop()?.split(';').shift()
          console.log('Provider - Token found:', !!token)
          if (token && /^[a-zA-Z0-9\-_.]+$/.test(token)) {
            // Decode token to check expiration
            const parts = token.split('.')
            console.log('Provider - Token parts:', parts.length)
            if (parts.length === 3) {
              const payload = parts[1]
              const decoded = JSON.parse(atob(payload))
              const now = Date.now() / 1000
              const isValid = decoded.exp > now
              console.log(
                'Provider - Token valid:',
                isValid,
                'Exp:',
                decoded.exp,
                'Now:',
                now
              )
              return isValid
            }
          }
        }
        console.log('Provider - No valid token found')
        return false
      } catch (error) {
        console.error('Error checking access token:', error)
        return false
      }
    }

    const hasToken = hasValidToken()
    console.log('Provider - Has valid token:', hasToken)

    if (hasToken) {
      console.log('Provider - Calling fetchUser and initializeProactiveRefresh')
      // Call fetchUser first, which will also call initializeProactiveRefresh
      useAuthStore.getState().fetchUser()
      // We don't need to call initializeProactiveRefresh here as it's called in fetchUser
      // This might be causing the issue - double initialization
      // initializeProactiveRefresh()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster duration={8000} position={'top-center'} richColors />
    </QueryClientProvider>
  )
}
