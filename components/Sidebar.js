'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'

const NAV = [
  { href: '/dashboard',         label: 'Dashboard',       icon: '◎' },
  { href: '/production',        label: 'Production',      icon: '⚙' },
  { href: '/products',          label: 'Products',        icon: '✦' },
  { href: '/attendance',        label: 'Attendance',      icon: '◷' },
  { href: '/payroll',           label: 'Payroll',         icon: '₨' },
  { href: '/purchase-orders',   label: 'POs',             icon: '⊞' },
  { href: '/fabric-inventory',  label: 'Fabric',          icon: '◫' },
  { href: '/loans',             label: 'Loans',           icon: '⊡' },
]

export default function Sidebar() {
  const path = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-ink-900 text-sand-200 flex flex-col z-50">
      <div className="px-5 pt-6 pb-4 border-b border-ink-700">
        <div className="text-xs font-bold tracking-[0.2em] text-ak-900 uppercase">Ayesha Khurram</div>
        <div className="text-[0.65rem] font-semibold tracking-[0.15em] text-ink-400 mt-0.5 uppercase">Production System</div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV.map(n => {
          const active = path === n.href || path.startsWith(n.href + '/')
          return (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-ak-900 text-white shadow-lg shadow-ak-900/30' : 'text-ink-300 hover:bg-ink-800 hover:text-sand-100'}`}>
              <span className="text-base w-5 text-center">{n.icon}</span>{n.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-ink-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-sand-100">{user?.name}</div>
            <div className="text-[0.65rem] text-ink-400 font-semibold uppercase tracking-wider">{user?.role}</div>
          </div>
          <button onClick={logout} className="text-xs text-ink-400 hover:text-ak-500 font-semibold transition-colors">Exit</button>
        </div>
      </div>
    </aside>
  )
}
