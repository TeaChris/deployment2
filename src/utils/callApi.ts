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

import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  CancelTokenSource,
} from 'axios'
import { toast } from 'sonner'
import Router from 'next/router'

import { isObject } from './utils'
import { ApiError, ApiResponse } from '@/types'
import { addRequestToQueue, getRefreshPromise, refreshToken } from '@/config'

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL
const FRONTENDURL = process.env.NEXT_PUBLIC_FRONTEND_URL

if (!BASEURL) {
  throw new Error('add BASEURL to your env file')
}

// axios client
const apiClient: AxiosInstance = axios.create({
  baseURL: BASEURL,
  withCredentials: true, // allows sending HttpOnly cookies
})

// REQUEST CANCELLATION MAP
const cancelTokens = new Map<string, CancelTokenSource>()

function getCancelToken(endpoint: string) {
  if (cancelTokens.has(endpoint)) {
    cancelTokens.get(endpoint)?.cancel('Canceled due to new request')
  }
  const source = axios.CancelToken.source()
  cancelTokens.set(endpoint, source)
  return source
}

// RETRY LOGIC
async function retryAfterRefresh<T>(
  error: AxiosError
): Promise<AxiosResponse<T>> {
  await apiClient.get('/auth/refresh')
  const config = error.config
  if (!config) throw new Error('No config available for retry')
  return apiClient.request<T>(config)
}

// REDIRECT HANDLER
function handleRedirect(status: number) {
  const redirects: Record<number, string> = {
    401: '/sign-in',
    403: '/', // unauthorized
    404: '/not-found',
    422: '/verify-email',
    500: '/error',
  }
  if (redirects[status]) {
    Router.replace(redirects[status])
  }
}

// export const callApi = async <T>(
//   endpoint: string,
//   data?: Record<string, unknown> | FormData,
//   method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
// ): Promise<{ data?: ApiResponse<T>; error?: ApiError }> => {
//   const cancelToken = getCancelToken(endpoint)

//   try {
//     const response: AxiosResponse<ApiResponse<T>> = await apiClient.request<
//       ApiResponse<T>
//     >({
//       method: method || (data ? 'POST' : 'GET'),
//       url: endpoint,
//       ...(data && { data }),
//       headers: {
//         'x-referrer': FRONTENDURL ?? 'https://www.flash.com',
//         ...(isObject(data)
//           ? {
//               'Content-Type': 'application/json',
//               Accept: 'application/json',
//             }
//           : {
//               'Content-Type': 'multipart/form-data',
//             }),
//       },
//       cancelToken: cancelToken.token,
//     })

//     return { data: response.data }
//   } catch (err) {
//     const error = err as AxiosError
//     const response = error.response

//     // Network or CORS error
//     if (!response) {
//       toast.error('Network error. Please check your connection.')
//       return { error: { message: 'Network error', status: 'Error' } }
//     }

//     const status = response.status
//     const apiError: ApiError = response.data as ApiError

//     switch (status) {
//       case 400:
//         toast.error(apiError.message || 'Invalid request')
//         break

//       case 401:
//         try {
//           const retryResponse = await retryAfterRefresh<ApiResponse<T>>(error)
//           return { data: retryResponse.data }
//         } catch {
//           toast.error('Session expired. Please sign in again.')
//           handleRedirect(401)
//         }
//         break

//       case 403:
//         toast.error(apiError.message || 'Permission denied')
//         handleRedirect(403)
//         break

//       case 404:
//         toast.error(apiError.message || 'Resource not found')
//         handleRedirect(404)
//         break

//       case 408:
//         toast.error(apiError.message || 'Request timed out. Please try again.')
//         break

//       case 422:
//         toast.error(
//           apiError.message || 'Please verify your email before continuing.'
//         )
//         handleRedirect(422)
//         break

//       case 429:
//         toast.error(apiError.message || 'Too many requests. Try again later.')
//         break

//       case 500:
//       case 502:
//       case 503:
//       case 504:
//         toast.error('Server error. Please try again later.')
//         handleRedirect(500)
//         break

//       default:
//         console.error(`Unhandled API error: ${status}`, apiError)
//     }

//     return { error: apiError }
//   }
// }

export interface CallApiOptions<T> {
  endpoint: string
  data?: Record<string, unknown> | FormData
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  signal?: AbortSignal
}

export const callApi = async <T>({
  endpoint,
  data,
  method,
  signal,
}: CallApiOptions<T>): Promise<{ data?: ApiResponse<T>; error?: ApiError }> => {
  const source = getCancelToken(endpoint)

  if (signal) {
    signal.addEventListener('abort', () => {
      source.cancel(`Request aborted: ${endpoint}`)
    })
  }

  const requestConfig = {
    baseURL: process.env.API_BASE_URL,
    method: method || (data ? 'POST' : 'GET'),
    url: endpoint,
    ...(data && { data }),
    headers: {
      'x-referrer': FRONTENDURL ?? 'https://www.flash.com',
      ...(isObject(data)
        ? {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }
        : {
            'Content-Type': 'multipart/form-data',
          }),
    },
    cancelToken: source.token,
    withCredentials: true,
  } as const

  try {
    const response = await axios.request<ApiResponse<T>>(requestConfig)
    return { data: response.data }
  } catch (err) {
    if (axios.isCancel(err)) {
      return { error: { message: 'Request canceled', status: 'Canceled' } }
    }

    const error = err as AxiosError
    const response = error.response

    if (!response) {
      toast.error('Network error. Please check your connection.')
      return { error: { message: 'Network error', status: 'Error' } }
    }

    const status = response.status
    const apiError = response.data as ApiError

    if (status === 401) {
      return new Promise((resolve, reject) => {
        addRequestToQueue(async () => {
          try {
            const retryResponse = await axios.request<ApiResponse<T>>(
              requestConfig
            )
            resolve({ data: retryResponse.data })
          } catch (retryErr) {
            reject(retryErr)
          }
        })
        ;(getRefreshPromise() || refreshToken()).catch(() => {
          toast.error('Session expired. Please sign in again.')
          window.location.href = '/sign-in'
          reject({ error: apiError })
        })
      })
    }

    // Centralized non-401 error handling
    handleHttpError(status, apiError)

    return { error: apiError }
  }
}

function handleHttpError(status: number, apiError: ApiError) {
  switch (status) {
    case 400:
      toast.error(apiError.message || 'Invalid request')
      break
    case 401:
      try {
        const retryResponse = await retryAfterRefresh<ApiResponse<T>>(error)
        return { data: retryResponse.data }
      } catch {
        toast.error('Session expired. Please sign in again.')
        handleRedirect(401)
      }
      break
    case 403:
      toast.error(apiError.message || 'Permission denied')
      // window.location.href = '/forbidden'
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
      // window.location.href = '/verify-email'
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
