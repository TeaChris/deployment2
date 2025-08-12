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

import axios from 'axios'

import type { ApiResponse } from '@/types'

const FRONTENDURL = process.env.NEXT_PUBLIC_FRONTEND_URL

let refreshPromise: Promise<void> | null = null
let requestQueue: (() => void)[] = []

export function addRequestToQueue(callback: () => void) {
  requestQueue.push(callback)
}

function flushRequestQueue() {
  requestQueue.forEach((cb) => cb())
  requestQueue = []
}

export async function refreshToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        await axios.post<ApiResponse<null>>('/auth/refresh-token', null, {
          baseURL: process.env.NEXT_PUBLIC_BASE_URL, // align with apiClient
          withCredentials: true,
          headers: { 'x-referrer': FRONTENDURL ?? 'https://www.flash.com' },
        })
        flushRequestQueue()
      } catch (err) {
        requestQueue = [] // drop queued requests on failure
        throw err
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

export function getRefreshPromise() {
  return refreshPromise
}
