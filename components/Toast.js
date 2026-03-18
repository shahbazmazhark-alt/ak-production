'use client'
import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)
export function useToast() { return useContext(ToastCtx) }

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  const colors = {
    info: 'bg-ink-800 text-sand-100',
    success: 'bg-emerald-800 text-emerald-50',
    error: 'bg-ak-900 text-white',
  }

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[100]">
        {toasts.map(t => (
          <div key={t.id} className={`toast-enter px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold ${colors[t.type] || colors.info}`}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
