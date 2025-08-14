/*
 * ############################################################################### *
 * Created Date: Mo Aug 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Wed Aug 13 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

import { redirect } from 'next/navigation'

import axios, { AxiosError, AxiosResponse, CancelTokenSource } from 'axios'
import { toast } from 'sonner'

import { isObject } from '@/utils'
import { ApiResponse, ApiError } from '@/types'
import { refreshToken, addRequestToQueue } from '@/config'

// Helper function to get cookie value with XSS protection
function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  try {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift()
      // Basic XSS protection - only allow alphanumeric, hyphens, and underscores
      if (cookieValue && /^[a-zA-Z0-9\-_]+$/.test(cookieValue)) {
        return cookieValue
      }
    }
    return undefined
  } catch (error) {
    console.error('Error parsing cookie:', error)
    return undefined
  }
}

const BASEURL = process.env.VITE_PUBLIC_BASE_URL
const FRONTENDURL = process.env.NEXT_PUBLIC_FRONTEND_URL

/* ---------- Cancel token store ---------- */
const cancelTokens: Record<string, CancelTokenSource> = {}

function getCancelToken(endpoint: string): CancelTokenSource {
  if (cancelTokens[endpoint]) {
    cancelTokens[endpoint].cancel(`Cancelled previous request to ${endpoint}`)
  }
  const source = axios.CancelToken.source()
  cancelTokens[endpoint] = source
  return source
}

/* ---------- Axios instance ---------- */
export const apiClient = axios.create({
  baseURL: BASEURL,
  withCredentials: true,
})

/* ---------- Centralized error handling ---------- */
function handleHttpError(status: number, apiError: ApiError) {
  switch (status) {
    case 400:
      toast.error(apiError.message || 'Invalid request')
      break
    case 403:
      toast.error(apiError.message || 'Permission denied')
      handleRedirect(403)
      break
    case 404:
      toast.error(apiError.message || 'Not found')
      break
    case 408:
      toast.error(apiError.message || 'Request timed out')
      break
    case 422:
      toast.error(apiError.message || 'Please verify your email.')
      handleRedirect(422)
      break
    case 429:
      toast.error(apiError.message || 'Too many requests')
      break
    case 500:
    case 502:
    case 503:
    case 504:
      toast.error('Server error. Please try again later.')
      handleRedirect(500)
      break
    default:
      console.error(`Unhandled API error: ${status}`, apiError)
  }
}

/* ---------- Retry after token refresh ---------- */
// async function retryAfterRefresh<T>(
//   error: AxiosError
// ): Promise<AxiosResponse<ApiResponse<T>>> {
//   return new Promise((resolve, reject) => {
//     addRequestToQueue(async () => {
//       try {
//         if (!error.config) throw new Error('No config available for retry')
//         const retryResponse = await apiClient.request<ApiResponse<T>>(
//           error.config
//         )
//         resolve(retryResponse)
//       } catch (err) {
//         reject(err)
//       }
//     })
//   })
// }

async function retryAfterRefresh<T>(error: AxiosError<ApiError>) {
  const original = error.config!
  return apiClient.request<ApiResponse<T>>({ ...original })
}

/* ---------- Redirect helper ---------- */
function handleRedirect(status: number) {
  switch (status) {
    case 401:
      redirect('/sign-in')
      break
    case 403:
      redirect('/forbidden')
      break
    case 404:
      redirect('/not-found')
      break
    case 422:
      redirect('/verify-email')
      break
    case 500:
      redirect('/server-error')
      break
    default:
      redirect('/server-error')
  }
}

/* ---------- Main callApi ---------- */
export async function api<T>(
  endpoint: string,
  data?: Record<string, unknown> | FormData,
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
): Promise<{ data?: ApiResponse<T>; error?: ApiError }> {
  const cancelToken = getCancelToken(endpoint)

  try {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.request<
      ApiResponse<T>
    >({
      method: method || (data ? 'POST' : 'GET'),
      url: endpoint,
      ...(data && { data }),
      headers: {
        'x-referrer': FRONTENDURL ?? 'https://www.flash.com',
        ...(isObject(data)
          ? { 'Content-Type': 'application/json', Accept: 'application/json' }
          : { 'Content-Type': 'multipart/form-data' }),
        // Add CSRF token for state-changing requests
        ...(method &&
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && {
            'x-csrf-token': getCookie('csrfToken') || '',
          }),
      },
      cancelToken: cancelToken.token,
    })

    return { data: response.data }
  } catch (err) {
    const error = err as AxiosError<ApiError>
    const response = error.response

    if (!response) {
      toast.error('Network error. Please check your connection.')
      return { error: { message: 'Network error', status: 'Error' } }
    }

    const status = response.status
    const apiError = response.data

    if (status === 401) {
      try {
        // Try to refresh token
        await refreshToken()
        const retryResponse = await retryAfterRefresh<T>(error)
        return { data: retryResponse.data }
      } catch (refreshError) {
        // If refresh fails, user needs to sign in again
        console.error('Token refresh failed:', refreshError)
        toast.error('Session expired. Please sign in again.')
        handleRedirect(401)
      }
    } else {
      handleHttpError(status, apiError)
    }

    return { error: apiError }
  }
}
