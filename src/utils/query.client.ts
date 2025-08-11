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

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // don’t refetch just because tab is active
      retry: 1, // retry failed requests once
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})
