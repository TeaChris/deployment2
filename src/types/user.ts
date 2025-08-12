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

export interface IUserBase {
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
  ipAddress: string
  verificationToken: string
  isDeleted: boolean
  isSuspended: boolean
  loginRetries: number
  // refreshToken: string;

  isTermAndConditionAccepted: boolean
}

export interface IUser extends IUserBase {
  isEmailVerified: boolean
  username: string
  email: string
  role: Role
}

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
