import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { api } from '@/utils'
import { ApiError, IUser } from '@/types'
import { clearRefreshTimer, initializeProactiveRefresh } from '@/config'

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
      error: null,
      isLoading: false,
      isAuthenticated: false,

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
            initializeProactiveRefresh() // Initialize proactive refresh after successful user fetch
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

      setUser: (user) => {
        set({ user, isAuthenticated: true, error: null })
        // Initialize proactive token refresh when user is set
        initializeProactiveRefresh()
      },

      logout: async () => {
        try {
          set({ isLoading: true })
          await api('/auth/signout', {
            method: 'POST',
          })
        } catch (error) {
          console.error('Logout failed:', error)
        } finally {
          // Clear refresh timer on logout
          clearRefreshTimer()

          // Dispatch logout event for proactive refresh cleanup
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('user-logout'))
          }

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
      storage: createJSONStorage(() => {
        // Use localStorage for persistence but with encryption
        if (typeof window !== 'undefined') {
          return {
            getItem: (name: string) => {
              try {
                const item = localStorage.getItem(name)
                return item ? JSON.parse(item) : null
              } catch {
                return null
              }
            },
            setItem: (name: string, value: unknown) => {
              try {
                localStorage.setItem(name, JSON.stringify(value))
              } catch (error) {
                console.error('Failed to save to localStorage:', error)
              }
            },
            removeItem: (name: string) => {
              try {
                localStorage.removeItem(name)
              } catch (error) {
                console.error('Failed to remove from localStorage:', error)
              }
            },
          }
        }
        return sessionStorage
      }),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !['isLoading', 'error', '_hasHydrated'].includes(key)
          )
        ) as AuthState & { _hasHydrated?: boolean },
    }
  )
)
