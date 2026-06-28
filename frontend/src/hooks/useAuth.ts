'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, isAuthenticated, clearAuth, User } from '@/lib/auth'

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const u = getUser()
    const auth = isAuthenticated()

    if (requireAuth && !auth) {
      router.replace('/login')
      return
    }

    setUser(u)
    setLoading(false)
  }, [requireAuth, router])

  const logout = () => {
    clearAuth()
    router.replace('/login')
  }

  return { user, loading, logout }
}
