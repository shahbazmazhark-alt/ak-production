'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const AuthCtx = createContext(null)
export function useAuth() { return useContext(AuthCtx) }

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('ak_user')
    if (saved) { try { setUser(JSON.parse(saved)) } catch {} }
    setLoading(false)
  }, [])

  const login = useCallback(async (pin) => {
    const { data, error } = await supabase
      .from('users').select('id, name, pin, role, is_active').eq('pin', pin).single()
    if (error || !data || data.is_active === false) return { ok: false }
    const u = { id: data.id, name: data.name, role: data.role }
    setUser(u)
    localStorage.setItem('ak_user', JSON.stringify(u))
    return { ok: true, user: u }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('ak_user')
  }, [])

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>
}
