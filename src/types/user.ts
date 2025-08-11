/*
 * ############################################################################### *
 * Created Date: Su Aug 2025                                                   *
 * Author: Boluwatife Olasunkanmi O.                                           *
 * -----                                                                       *
 * Last Modified: Mon Aug 11 2025                                              *
 * Modified By: Boluwatife Olasunkanmi O.                                      *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                               *
 * ############################################################################### *
 */

export interface IUser {
  role: Role
  email: string
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
  username: string
  password: string
  ipAddress: string
  verificationToken: string
  isDeleted: boolean
  isSuspended: boolean
  loginRetries: number
  // refreshToken: string;
  isEmailVerified: boolean
  isTermAndConditionAccepted: boolean
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
