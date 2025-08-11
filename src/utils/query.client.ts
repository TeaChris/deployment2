/*
 * ############################################################################### *
 * Created Date: Mo Aug 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Mon Aug 11 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import { QueryClient, QueryCache } from '@tanstack/react-query'
import { refreshToken, addRequestToQueue } from '@/config'
import { ApiError } from '@/types'

let isRefreshing = false

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: async (error: ApiError, query) => {
      if (error?.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true
          try {
            await refreshToken()
          } catch {
            isRefreshing = false
            throw error
          }
          isRefreshing = false
        }

        // Queue the query retry
        await new Promise<void>((resolve) => {
          addRequestToQueue(async () => {
            await query.fetch()
            resolve()
          })
        })
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 60 * 1000,
    },
  },
})
