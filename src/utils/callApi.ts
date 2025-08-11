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

import axios, { AxiosInstance, AxiosResponse } from 'axios'

import { ApiError, ApiResponse } from '@/types'

// import { useInitSession } from '@/store'

import { toast } from 'sonner'

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL
const FRONTENDURL = process.env.NEXT_PUBLIC_FRONTEND_URL

if (!BASEURL) {
  throw new Error('add BASEURL to your env file')
}

export const isObject = (value: unknown): value is Record<string, unknown> => {
  const isArray = Array.isArray(value)
  const isFormData = value instanceof FormData
  const isObject = typeof value === 'object' && value !== null

  return !isArray && !isFormData && isObject
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASEURL,
  withCredentials: true,
})

export const callApi = async <T>(
  endpoint: string,
  data?: Record<string, unknown> | FormData,
  extraMethods?: 'PUT' | 'DELETE' | 'PATCH'
): Promise<{ data?: ApiResponse<T>; error?: ApiError }> => {
  const cancelTokenSource = axios.CancelToken.source()

  try {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient.request<
      ApiResponse<T>
    >({
      method:
        extraMethods && data
          ? extraMethods
          : data && !extraMethods
          ? 'POST'
          : 'GET',
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
      cancelToken: cancelTokenSource.token,
    })

    return { data: response.data }
  } catch (error) {
    let apiError: ApiError | undefined
    if (axios.isCancel(error)) {
      console.error('Previous request was canceled')
    }
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response
      apiError = data
      switch (status) {
        case 400:
          toast.error(data.message || 'Invalid request')
          break
        case 401:
          {
            try {
              await apiClient.get('/auth/refresh')
              const config = error.config
              if (!config) {
                throw new Error('Cannot retry request without config')
              }
              const retryResponse = await apiClient.request<ApiResponse<T>>(
                config
              )
              if (retryResponse.data) {
                return { data: retryResponse.data }
              }
            } catch {
              // Refresh failed → force logout
              //   useAuthStore.getState().logout()
              window.location.href = '/sign-in'
            }
          }
          break
        case 403:
          toast.error(
            error.message || 'You do not have permission to perform this action'
          )

          window.location.href = '/'
          break
        case 404:
          // resource not found
          toast.error(error.message)
          window.location.href = '/not-found'
          break
        case 408:
          toast.error(error.message || 'Request timed out. Please try again.')
          break
        case 422:
          toast.error(
            error.message || 'Please verify your email before continuing.'
          )
          window.location.href = '/verify-email'
          break
        case 429:
          toast.error(
            error.message || 'Too many requests. Please try again later.'
          )
          console.error('Bad request')
          break
        case 500:
          // internal server error
          // redirect to error page
          toast.error(error.message)
          console.error(`Internal server error`)
          window.location.href = '/error'
          break
        case 502:
        case 503:
        case 504:
          toast.error('Server is temporarily unavailable. Please try later.')
          break
        default:
          console.error(`Unknown API error: ${status}`)
      }
    } else {
      if (error instanceof Error) {
        apiError = { message: error.message, status: 'Error' }
      }
    }
    return { error: apiError }
  }
}
