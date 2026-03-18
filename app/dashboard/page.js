'use client'
import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr, STAGES } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

function Stat({ label, value, sub, color = 'bg-sand-100' }) {
  return (
    <div className={color + ' rounded-2xl p-5 card-hover'}>
      <div className="text-[0.65rem] font-bold tracking-[0.12em] text-ink-400 uppercase mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-ink-900">{value ?? '—'}</div>
      {sub && <div className="text-xs text-ink-400 font-semibold mt-1">{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [stageCount, setStageCount] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [pRes, oRes, wRes, cRes, poRes, recent] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('production_orders').select('id, current_stage, is_split', { count: 'exact' }),
          supabase.from('workers').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('unit_cards').select('id, current_stage'),
          supabase.from('purchase_orders').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
          supabase.from('production_orders').select('*').order('created_at', { ascending: false }).limit(10),
        ])

        const active = (oRes.data || []).filter(o => o.current_stage !== 'Dispatched')
        const sc = {}
        STAGES.forEach(s => sc[s] = 0)
        // Count unsplit orders
        ;(oRes.data || []).filter(o => !o.is_split).forEach(o => { if (sc[o.current_stage] !== undefined) sc[o.current_stage]++ })
        // Count split unit cards
        ;(cRes.data || []).forEach(c => { if (sc[c.current_stage] !== undefined) sc[c.current_stage]++ })

        setStats({
          products: pRes.count || 0,
          orders: oRes.count || 0,
          active: active.length,
          workers: wRes.count || 0,
          pendingPOs: poRes.count || 0,
          totalCards: (cRes.data || []).length,
        })
        setStageCount(sc)
        setRecentOrders(recent.data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [])

  const h = new Date().getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink-900">{greeting}, {user?.name}</h1>
        <p className="text-sm text-ink-400 font-semibold mt-1">Production overview</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Stat label="Products" value={stats?.products} sub="active" />
            <Stat label="Active Orders" value={stats?.active} sub={'of ' + stats?.orders + ' total'} color="bg-ak-100" />
            <Stat label="Unit Cards" value={stats?.totalCards} sub="across stages" />
            <Stat label="Pending POs" value={stats?.pendingPOs} sub="awaiting approval" />
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 p-5 mb-8">
            <h2 className="text-xs font-bold tracking-[0.12em] text-ink-400 uppercase mb-4">Stage Pipeline</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {STAGES.map(s => (
                <div key={s} className="flex-1 min-w-[100px] bg-sand-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-extrabold text-ink-900">{stageCount[s] || 0}</div>
                  <div className="text-[0.6rem] font-bold text-ink-400 mt-1 leading-tight">{s}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-sand-200 p-5">
            <h2 className="text-xs font-bold tracking-[0.12em] text-ink-400 uppercase mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? <p className="text-sm text-ink-300 py-4">No orders yet.</p> : (
              <table className="ak-table">
                <thead><tr><th>Product</th><th>Units</th><th>Stage</th><th>Purpose</th><th>Master</th><th>Date</th></tr></thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o.id}>
                      <td className="font-semibold">{o.product_label || o.product_name || '—'}</td>
                      <td>{o.total_units}</td>
                      <td><span className={'stage-badge ' + (o.current_stage === 'Dispatched' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>{o.current_stage || '—'}</span></td>
                      <td className="text-ink-400 text-sm">{o.purpose || '—'}</td>
                      <td className="text-ink-400 text-sm">{o.master || '—'}</td>
                      <td className="text-ink-400 text-xs">{o.order_date || o.created_at?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </AppShell>
  )
}
