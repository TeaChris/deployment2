/*
 * ###############################################################################
 * Created Date: Mo Aug 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed Aug 13 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ###############################################################################
 */

import axios from 'axios'

import type { ApiResponse } from '@/types'

const FRONTENDURL = process.env.NEXT_PUBLIC_FRONTEND_URL

let refreshPromise: Promise<void> | null = null
let refreshTimer: NodeJS.Timeout | null = null
let requestQueue: Array<() => void> = []

interface JWTPayload {
  id: string
  exp: number
  iat: number
}

// Helper function to get cookie value
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  try {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift()
      if (cookieValue && /^[a-zA-Z0-9\-_.]+$/.test(cookieValue)) {
        return cookieValue
      }
    }
    return undefined
  } catch (error) {
    console.error('Error parsing cookie:', error)
    return undefined
  }
}

// Helper function to decode JWT token
function decodeToken(token: string): JWTPayload | null {
  try {
    // Simple JWT decode (base64 decode the payload part)
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// Calculate time until token expires (in milliseconds)
function getTimeUntilExpiry(token: string): number {
  const decoded = decodeToken(token)
  if (!decoded) return 0

  const now = Date.now() / 1000 // Convert to seconds
  const timeUntilExpiry = (decoded.exp - now) * 1000 // Convert to milliseconds

  return Math.max(0, timeUntilExpiry)
}

// Schedule proactive token refresh
function scheduleProactiveRefresh(): void {
  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }

  const accessToken = getCookie('flashAccessToken')
  if (!accessToken) return

  const timeUntilExpiry = getTimeUntilExpiry(accessToken)

  // If token expires in less than 5 minutes, refresh immediately
  if (timeUntilExpiry < 5 * 60 * 1000) {
    refreshToken()
    return
  }

  // Schedule refresh 5 minutes before expiry
  const refreshTime = timeUntilExpiry - 5 * 60 * 1000

  refreshTimer = setTimeout(() => {
    refreshToken()
  }, refreshTime)

  // Dispatch custom event for monitoring
  window.dispatchEvent(
    new CustomEvent('token-schedule', {
      detail: { timeUntilRefresh: refreshTime },
    })
  )

  console.log(
    `Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`
  )
}

// Initialize proactive refresh mechanism
export function initializeProactiveRefresh(): void {
  if (typeof window === 'undefined') return

  // Schedule initial refresh
  scheduleProactiveRefresh()

  // Listen for storage events (in case tokens are updated in another tab)
  window.addEventListener('storage', (event) => {
    if (event.key === 'flashAccessToken' || event.key === 'flashRefreshToken') {
      scheduleProactiveRefresh()
    }
  })

  // Listen for focus events to check token status when user returns to tab
  window.addEventListener('focus', () => {
    scheduleProactiveRefresh()
  })
}

// Clean up timers and listeners
export function cleanupProactiveRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

export function addRequestToQueue(cb: () => void) {
  requestQueue.push(cb)
}

function flushRequestQueue() {
  const pending = requestQueue
  requestQueue = []
  for (const cb of pending) cb()
}

export async function refreshToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await axios.post<ApiResponse<null>>('/auth/refresh-token', null, {
          baseURL: process.env.NEXT_PUBLIC_BASE_URL,
          withCredentials: true,
          headers: { 'x-referrer': FRONTENDURL ?? 'https://www.flash.com' },
        })

        // Dispatch custom event for monitoring
        window.dispatchEvent(new CustomEvent('token-refresh'))

        // Schedule next proactive refresh after successful refresh
        scheduleProactiveRefresh()

        flushRequestQueue()
      } catch (error) {
        console.error('Token refresh failed:', error)
        // If refresh fails, clear the timer and let the next 401 handle it
        cleanupProactiveRefresh()
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

export function getRefreshPromise() {
  return refreshPromise
}

// Export cleanup function for use in logout
export function clearRefreshTimer() {
  cleanupProactiveRefresh()
}
