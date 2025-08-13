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

import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'

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

export function useApiMutation<T, V>(
  mutationKey: string[],
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  wrapKey?: string,
  options?: UseMutationOptions<ApiResponse<T>, Error, V>
) {
  return useMutation<ApiResponse<T>, Error, V>({
    mutationKey,
    mutationFn: (variables: V) => {
      let payload = variables as Record<string, unknown> | FormData | undefined
      if (wrapKey) {
        payload = { [wrapKey]: variables }
      }
      return api<T>(endpoint, payload, method).then((res) => {
        if (res.error) throw new Error(res.error.message)
        return res.data!
      })
    },
    ...options,
  })
}
