/*
 * ###############################################################################
 * Created Date: Wed Aug 13 2025                                               *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: We/08/2025 08:nn:44
 * Modified By: Boluwatife Olasunkanmi O.
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ###############################################################################
 */

'use client'

import { useProactiveRefresh } from '@/hooks/proactive.refresh'

export function TokenRefreshStatus() {
  const { isActive, lastRefreshTime, nextRefreshTime, refreshCount } =
    useProactiveRefresh()

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-semibold text-sm mb-2">🔄 Token Refresh Status</h3>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <span
            className={`inline-block w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span className={isActive ? 'text-green-600' : 'text-red-600'}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div>
          <span className="font-medium">Refresh Count:</span> {refreshCount}
        </div>
        {lastRefreshTime && (
          <div>
            <span className="font-medium">Last Refresh:</span>{' '}
            {lastRefreshTime.toLocaleTimeString()}
          </div>
        )}
        {nextRefreshTime && (
          <div>
            <span className="font-medium">Next Refresh:</span>{' '}
            {nextRefreshTime.toLocaleTimeString()}
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="font-medium">Debug Info:</span>
          <div className="mt-1">
            <span className="font-medium">Cookie Present:</span>{' '}
            {typeof window !== 'undefined' && document.cookie.includes('flashAccessToken') ? 'Yes' : 'No'}
          </div>
        </div>
      </div>
    </div>
  )
}
