/*
 * ###############################################################################
 * Created Date: Tue Aug 12 2025                                               *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed Aug 13 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ###############################################################################
 */

import { useEffect, useState } from 'react'
import {
  initializeProactiveRefresh,
  clearRefreshTimer,
} from '@/config/token.refresh.manager'

interface ProactiveRefreshState {
  isActive: boolean
  lastRefreshTime: Date | null
  nextRefreshTime: Date | null
  refreshCount: number
}

// Helper function to check if user has valid access token
function hasValidAccessToken(): boolean {
  if (typeof document === 'undefined') return false

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

export function useProactiveRefresh() {
  const [state, setState] = useState<ProactiveRefreshState>({
    isActive: false,
    lastRefreshTime: null,
    nextRefreshTime: null,
    refreshCount: 0,
  })

  useEffect(() => {
    // Only initialize if user has valid access token
    if (hasValidAccessToken()) {
      initializeProactiveRefresh()
      setState((prev) => ({ ...prev, isActive: true }))
    }

    // Cleanup on unmount
    return () => {
      clearRefreshTimer()
      setState((prev) => ({ ...prev, isActive: false }))
    }
  }, [])

  // Listen for custom events to track refresh activity
  useEffect(() => {
    const handleRefresh = () => {
      setState((prev) => ({
        ...prev,
        lastRefreshTime: new Date(),
        refreshCount: prev.refreshCount + 1,
      }))
    }

    const handleSchedule = (event: CustomEvent) => {
      const nextRefreshTime = new Date(
        Date.now() + event.detail.timeUntilRefresh
      )
      setState((prev) => ({ ...prev, nextRefreshTime }))
    }

    const handleLogout = () => {
      clearRefreshTimer()
      setState({
        isActive: false,
        lastRefreshTime: null,
        nextRefreshTime: null,
        refreshCount: 0,
      })
    }

    // Listen for custom events
    window.addEventListener('token-refresh', handleRefresh)
    window.addEventListener('token-schedule', handleSchedule as EventListener)
    window.addEventListener('user-logout', handleLogout)

    return () => {
      window.removeEventListener('token-refresh', handleRefresh)
      window.removeEventListener(
        'token-schedule',
        handleSchedule as EventListener
      )
      window.removeEventListener('user-logout', handleLogout)
    }
  }, [])

  return state
}
