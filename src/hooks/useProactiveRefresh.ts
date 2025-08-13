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
  clearRefreshTimer,
  initializeProactiveRefresh,
} from '@/config/token.refresh.manager'

interface ProactiveRefreshState {
  isActive: boolean
  lastRefreshTime: Date | null
  nextRefreshTime: Date | null
  refreshCount: number
}

export function useProactiveRefresh() {
  const [state, setState] = useState<ProactiveRefreshState>({
    isActive: false,
    lastRefreshTime: null,
    nextRefreshTime: null,
    refreshCount: 0,
  })

  useEffect(() => {
    // Initialize proactive refresh when hook mounts
    initializeProactiveRefresh()
    setState((prev) => ({ ...prev, isActive: true }))

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

    // Listen for custom events
    window.addEventListener('token-refresh', handleRefresh)
    window.addEventListener('token-schedule', handleSchedule as EventListener)

    return () => {
      window.removeEventListener('token-refresh', handleRefresh)
      window.removeEventListener(
        'token-schedule',
        handleSchedule as EventListener
      )
    }
  }, [])

  return state
}
