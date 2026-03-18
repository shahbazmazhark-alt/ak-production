'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'

export default function AppShell({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => { if (!loading && !user) router.replace('/') }, [user, loading, router])
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><div className="w-5 h-5 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-56 min-h-screen"><div className="p-6 lg:p-8 max-w-[1400px]">{children}</div></main>
    </div>
  )
}
