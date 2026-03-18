'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => { if (!loading && user) router.replace('/dashboard') }, [user, loading, router])

  const handleDigit = useCallback((d) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) {
      setChecking(true)
      login(next).then(res => {
        if (res.ok) router.replace('/dashboard')
        else { setError('Invalid PIN'); setPin(''); setChecking(false) }
      })
    }
  }, [pin, login, router])

  const handleBackspace = useCallback(() => { setPin(p => p.slice(0, -1)); setError('') }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      else if (e.key === 'Backspace') handleBackspace()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleDigit, handleBackspace])

  if (loading || user) return <div className="min-h-screen flex items-center justify-center bg-sand-50"><div className="w-5 h-5 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50">
      <div className="w-full max-w-xs text-center">
        <div className="mb-10">
          <h1 className="text-xs font-extrabold tracking-[0.25em] text-ak-900 uppercase">Ayesha Khurram</h1>
          <p className="text-[0.6rem] font-bold tracking-[0.2em] text-ink-400 mt-1 uppercase">Production System</p>
        </div>
        <div className="flex justify-center gap-4 mb-3">
          {[0,1,2,3].map(i => <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />)}
        </div>
        <div className="h-5 mb-4">
          {error && <p className="text-xs text-ak-900 font-semibold animate-pulse">{error}</p>}
          {checking && <p className="text-xs text-ink-400 font-semibold">Checking…</p>}
        </div>
        <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => handleDigit(String(n))} className="h-14 rounded-xl bg-sand-100 text-ink-800 text-lg font-bold hover:bg-sand-200 active:scale-95 transition-all">{n}</button>
          ))}
          <div />
          <button onClick={() => handleDigit('0')} className="h-14 rounded-xl bg-sand-100 text-ink-800 text-lg font-bold hover:bg-sand-200 active:scale-95 transition-all">0</button>
          <button onClick={handleBackspace} className="h-14 rounded-xl bg-sand-200 text-ink-500 text-sm font-bold hover:bg-sand-300 active:scale-95 transition-all">←</button>
        </div>
      </div>
    </div>
  )
}
