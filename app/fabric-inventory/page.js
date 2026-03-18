'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr } from '@/lib/supabase'

export default function FabricInventoryPage() {
  const [stock, setStock] = useState([])
  const [usage, setUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('summary')

  const load = useCallback(async () => {
    setLoading(true)
    const [sRes, uRes] = await Promise.all([
      supabase.from('fabric_stock').select('*').order('date_received', { ascending: false }),
      supabase.from('fabric_usage_log').select('*').order('date', { ascending: false }),
    ])
    setStock(sRes.data || [])
    setUsage(uRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Summary by fabric type
  const summary = useMemo(() => {
    const map = {}
    stock.forEach(s => {
      if (!map[s.fabric]) map[s.fabric] = { fabric: s.fabric, totalYards: 0, totalValue: 0, entries: 0 }
      map[s.fabric].totalYards += Number(s.yards || 0)
      map[s.fabric].totalValue += Number(s.yards || 0) * Number(s.rate || 0)
      map[s.fabric].entries++
    })
    // Subtract usage
    usage.forEach(u => {
      if (map[u.fabric]) map[u.fabric].totalYards -= Number(u.yards || 0)
    })
    return Object.values(map).sort((a, b) => a.fabric.localeCompare(b.fabric))
  }, [stock, usage])

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Fabric Inventory</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">{summary.length} fabric types tracked</p>
        </div>
        <div className="flex gap-1 bg-sand-100 p-1 rounded-xl">
          {[['summary', 'Summary'], ['stock', 'Stock In'], ['usage', 'Usage']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={'px-4 py-2 text-xs font-bold rounded-lg transition-all ' + (tab === k ? 'bg-white shadow text-ink-900' : 'text-ink-400 hover:text-ink-600')}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'summary' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.length === 0 ? (
            <p className="col-span-full text-sm text-ink-300 py-12 text-center">No fabric stock recorded yet. Stock is auto-added when fabric POs are marked as Received.</p>
          ) : summary.map(s => (
            <div key={s.fabric} className="bg-white rounded-2xl border border-sand-200 p-5">
              <h3 className="font-bold text-ink-900 text-lg">{s.fabric}</h3>
              <div className="text-2xl font-extrabold text-ak-900 mt-2">{Math.round(s.totalYards * 10) / 10} <span className="text-sm font-semibold text-ink-400">yards</span></div>
              <div className="flex gap-4 mt-2 text-xs text-ink-400">
                <span>Value: {pkr(Math.round(s.totalValue))}</span>
                <span>{s.entries} receipts</span>
              </div>
              {s.totalYards < 10 && <div className="mt-2 text-xs font-bold text-amber-700">⚠ Low stock</div>}
            </div>
          ))}
        </div>
      ) : tab === 'stock' ? (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {stock.length === 0 ? <p className="text-sm text-ink-300 py-12 text-center">No stock entries</p> : (
            <table className="ak-table">
              <thead><tr><th>Fabric</th><th>Yards</th><th className="text-right">Rate</th><th className="text-right">Value</th><th>Supplier</th><th>PO Ref</th><th>Received</th></tr></thead>
              <tbody>
                {stock.map(s => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.fabric}</td>
                    <td>{s.yards}</td>
                    <td className="text-right">{pkr(s.rate)}</td>
                    <td className="text-right font-bold">{pkr(Math.round(Number(s.yards) * Number(s.rate)))}</td>
                    <td className="text-ink-400">{s.supplier || '—'}</td>
                    <td className="text-xs font-mono">{s.po_ref || '—'}</td>
                    <td className="text-xs text-ink-400">{s.date_received}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {usage.length === 0 ? <p className="text-sm text-ink-300 py-12 text-center">No usage logged</p> : (
            <table className="ak-table">
              <thead><tr><th>Fabric</th><th>Yards Used</th><th>Product</th><th>Type</th><th>Date</th></tr></thead>
              <tbody>
                {usage.map(u => (
                  <tr key={u.id}>
                    <td className="font-semibold">{u.fabric}</td>
                    <td>{u.yards}</td>
                    <td>{u.product_label || '—'}</td>
                    <td className="text-ink-400">{u.type || '—'}</td>
                    <td className="text-xs text-ink-400">{u.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AppShell>
  )
}
