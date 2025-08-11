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

import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { api } from '@/utils'
import { ApiResponse } from '@/types'

export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: UseQueryOptions<ApiResponse<T>, Error>
) {
  return useQuery<ApiResponse<T>, Error>({
    queryKey: key,
    queryFn: () =>
      api<T>(endpoint).then((res) => {
        if (res.error) throw new Error(res.error.message)
        return res.data!
      }),
    retry: 2, // central retry
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
    ...options,
  })
}
