'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AUTH_TOKEN_KEY, clearAuth } from './auth'
import type { UserOut } from './api'
import { api } from './api'

type AuthContextValue = { user: UserOut | null; isLoading: boolean; logout: () => void }
const UserContext = createContext<AuthContextValue>({ user: null, isLoading: true, logout: () => {} })

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const publicRoute = pathname === '/login' || pathname === '/signup'
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      setUser(null)
      setIsLoading(false)
      if (!publicRoute) router.replace('/login')
      return
    }
    api.getCurrentUser().then((currentUser) => {
      setUser(currentUser)
      setIsLoading(false)
    }).catch(() => {
      clearAuth()
      setUser(null)
      setIsLoading(false)
      if (!publicRoute) router.replace('/login')
    })
  }, [pathname, router])

  const logout = () => {
    clearAuth()
    setUser(null)
    router.replace('/login')
  }

  return <UserContext.Provider value={{ user, isLoading, logout }}>{children}</UserContext.Provider>
}

export function useCurrentUser() {
  return useContext(UserContext).user
}

export function useAuth() {
  return useContext(UserContext)
}
