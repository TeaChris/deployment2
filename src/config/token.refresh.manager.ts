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
        await axios.get<ApiResponse<null>>('/auth/refresh', {
          baseURL: process.env.API_BASE_URL,
          withCredentials: true,
          headers: {
            'x-referrer': FRONTENDURL ?? 'https://www.flash.com',
          },
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
