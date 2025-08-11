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

export type ApiResponse<T = Record<string, unknown>> = {
  status: string
  message: string
  data: T
}

export interface ApiError {
  message: string
  status: string | number
  error?: unknown
  headers?: Record<string, unknown>
}
