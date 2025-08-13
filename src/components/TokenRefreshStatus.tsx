/*
 * ###############################################################################
 * Created Date: Tue Aug 12 2025                                               *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Tu/08/2025 09:nn:07
 * Modified By: Boluwatife Olasunkanmi O.
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ###############################################################################
 */

'use client'

import { useProactiveRefresh } from '@/hooks/useProactiveRefresh'

export function TokenRefreshStatus() {
  const { isActive, lastRefreshTime, nextRefreshTime, refreshCount } =
    useProactiveRefresh()

  if (!isActive) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-semibold text-sm mb-2">Token Refresh Status</h3>
      <div className="space-y-1 text-xs">
        <div>
          <span className="font-medium">Status:</span>{' '}
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1 ${
              isActive ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
          {isActive ? 'Active' : 'Inactive'}
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
      </div>
    </div>
  )
}
