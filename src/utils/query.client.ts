/*
 * ############################################################################### *
 * Created Date: Mo Aug 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Tue Aug 12 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import { QueryClient, QueryCache } from '@tanstack/react-query'
import { refreshToken, addRequestToQueue } from '@/config'
import { ApiError } from '@/types'

// let isRefreshing = false

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: async (error: unknown, query) => {
      // Let useApi.ts handle 401 errors and token refresh
      // This prevents duplicate refresh attempts
      console.error('Query error:', error)
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
