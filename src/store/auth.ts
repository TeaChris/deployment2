import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { api } from '@/utils'
import { IUser } from '@/types'

interface AuthState {
  user: IUser | null
  isAuthenticated: boolean
  fetchUser: () => Promise<void>
  setUser: (user: IUser) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      fetchUser: async () => {
        try {
          const res = await api<IUser>('/me')
          if (res.data?.data) {
            set({ user: res.data.data, isAuthenticated: true })
          }
        } catch (error) {
          console.error('Failed to fetch user:', error)
          set({ user: null, isAuthenticated: false })
        }
      },
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: async () => {
        try {
          await api('/signout', undefined, 'POST')
        } catch (error) {
          console.error('Logout failed:', error)
        } finally {
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
