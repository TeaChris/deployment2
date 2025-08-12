import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { api } from '@/utils'
import { ApiError, IUser } from '@/types'

interface AuthState {
  user: IUser | null
  isLoading: boolean
  error: ApiError | null
  isAuthenticated: boolean
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  setUser: (user: IUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      fetchUser: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await api<IUser>('/users/me')
          if (res.data) {
            set({
              user: res.data.data,
              isAuthenticated: true,
              isLoading: false,
            })
          }
        } catch (error: ApiError | unknown) {
          console.error('Failed to fetch user:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error as ApiError,
          })
        }
      },
      setUser: (user) => set({ user, isAuthenticated: true, error: null }),
      logout: async () => {
        try {
          set({ isLoading: true })
          await api('/auth/signout')
        } catch (error) {
          console.error('Logout failed:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['isLoading', 'error', '_hasHydrated'].includes(key)
          )
        ) as AuthState & { _hasHydrated?: boolean },
    }
  )
)
