'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr, today, can } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/components/AuthProvider'

const COMMON_FABRICS = ['Cotton Net', 'Organza', 'Viscose', 'Raw Silk', 'Swiss Lawn', 'Tissue']

export default function FabricInventoryPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [stock, setStock] = useState([])
  const [usage, setUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('summary')

  // Add stock form
  const [fabric, setFabric] = useState('')
  const [yards, setYards] = useState('')
  const [rate, setRate] = useState('')
  const [stockSupplier, setStockSupplier] = useState('')
  const [stockNote, setStockNote] = useState('')
  const [saving, setSaving] = useState(false)

  const canEdit = can(user, 'canEdit', 'fabric_inventory')

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

  // All fabric types from existing stock + common list
  const allFabricTypes = useMemo(() => {
    const fromStock = stock.map(s => s.fabric).filter(Boolean)
    return [...new Set([...COMMON_FABRICS, ...fromStock])].sort()
  }, [stock])

  // Summary by fabric type
  const summary = useMemo(() => {
    const map = {}
    stock.forEach(s => {
      if (!map[s.fabric]) map[s.fabric] = { fabric: s.fabric, totalYards: 0, totalValue: 0, entries: 0 }
      map[s.fabric].totalYards += Number(s.yards || 0)
      map[s.fabric].totalValue += Number(s.yards || 0) * Number(s.rate || 0)
      map[s.fabric].entries++
    })
    usage.forEach(u => {
      if (map[u.fabric]) map[u.fabric].totalYards -= Number(u.yards || 0)
    })
    return Object.values(map).sort((a, b) => a.fabric.localeCompare(b.fabric))
  }, [stock, usage])

  async function addStock(e) {
    e.preventDefault()
    if (!fabric || !yards) return toast('Fabric and yards are required', 'error')
    setSaving(true)
    try {
      const { error } = await supabase.from('fabric_stock').insert({
        fabric,
        yards: Number(yards),
        rate: rate ? Number(rate) : null,
        supplier: stockSupplier || null,
        po_ref: stockNote ? 'Manual: ' + stockNote : 'Manual entry',
        date_received: today(),
      })
      if (error) throw error
      toast(yards + ' yards of ' + fabric + ' added', 'success')
      setFabric(''); setYards(''); setRate(''); setStockSupplier(''); setStockNote('')
      setTab('summary')
      load()
    } catch (err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  async function deleteEntry(id) {
    const { error } = await supabase.from('fabric_stock').delete().eq('id', id)
    if (error) return toast(error.message, 'error')
    setStock(prev => prev.filter(s => s.id !== id))
    toast('Deleted', 'success')
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Fabric Inventory</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">{summary.length} fabric types · {Math.round(summary.reduce((s, f) => s + f.totalYards, 0) * 10) / 10} total yards</p>
        </div>
        <div className="flex gap-1 bg-sand-100 p-1 rounded-xl">
          {[['summary', 'Summary'], ['stock', 'Stock In'], ['usage', 'Usage'], ...(canEdit ? [['add', '+ Add Stock']] : [])].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={'px-4 py-2 text-xs font-bold rounded-lg transition-all ' + (tab === k ? 'bg-white shadow text-ink-900' : 'text-ink-400 hover:text-ink-600')}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'summary' ? (
        /* ── SUMMARY ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.length === 0 ? (
            <p className="col-span-full text-sm text-ink-300 py-12 text-center">No fabric stock yet. Add stock manually or mark Fabric POs as Received.</p>
          ) : summary.map(s => (
            <div key={s.fabric} className="bg-white rounded-2xl border border-sand-200 p-5">
              <h3 className="font-bold text-ink-900 text-lg">{s.fabric}</h3>
              <div className="text-2xl font-extrabold text-ak-900 mt-2">{Math.round(s.totalYards * 10) / 10} <span className="text-sm font-semibold text-ink-400">yards</span></div>
              <div className="flex gap-4 mt-2 text-xs text-ink-400">
                {s.totalValue > 0 && <span>Value: {pkr(Math.round(s.totalValue))}</span>}
                <span>{s.entries} receipt{s.entries !== 1 ? 's' : ''}</span>
              </div>
              {s.totalYards < 10 && s.totalYards > 0 && <div className="mt-2 text-xs font-bold text-amber-700">⚠ Low stock</div>}
              {s.totalYards <= 0 && <div className="mt-2 text-xs font-bold text-red-700">⚠ Out of stock</div>}
            </div>
          ))}
        </div>
      ) : tab === 'stock' ? (
        /* ── STOCK IN ── */
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {stock.length === 0 ? <p className="text-sm text-ink-300 py-12 text-center">No stock entries</p> : (
            <table className="ak-table">
              <thead><tr><th>Fabric</th><th>Yards</th><th className="text-right">Rate</th><th className="text-right">Value</th><th>Supplier</th><th>Source</th><th>Date</th>{canEdit && <th></th>}</tr></thead>
              <tbody>
                {stock.map(s => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.fabric}</td>
                    <td>{s.yards}</td>
                    <td className="text-right">{s.rate ? pkr(s.rate) : '—'}</td>
                    <td className="text-right font-bold">{s.rate ? pkr(Math.round(Number(s.yards) * Number(s.rate))) : '—'}</td>
                    <td className="text-ink-400">{s.supplier || '—'}</td>
                    <td className="text-xs"><span className={'stage-badge ' + (s.po_ref?.startsWith('Manual') ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800')}>{s.po_ref?.startsWith('Manual') ? 'Manual' : s.po_ref || 'PO'}</span></td>
                    <td className="text-xs text-ink-400">{s.date_received}</td>
                    {canEdit && (
                      <td className="text-right">
                        <button onClick={() => deleteEntry(s.id)} className="text-[0.65rem] font-bold text-red-400 hover:text-red-600">✕</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : tab === 'usage' ? (
        /* ── USAGE ── */
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {usage.length === 0 ? <p className="text-sm text-ink-300 py-12 text-center">No usage logged yet. Usage is tracked when fabric is cut for production orders.</p> : (
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
      ) : (
        /* ── ADD STOCK FORM ── */
        <div className="bg-white rounded-2xl border border-sand-200 p-6 max-w-lg">
          <h2 className="text-lg font-extrabold text-ink-900 mb-4">Add Fabric Stock</h2>
          <p className="text-xs text-ink-400 mb-4">Add existing fabric inventory or new purchases received outside of POs.</p>
          <form onSubmit={addStock} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Fabric Type</label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {allFabricTypes.map(f => (
                  <button key={f} type="button" onClick={() => setFabric(f)}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ' + (fabric === f ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400 hover:border-sand-300')}>{f}</button>
                ))}
              </div>
              <input type="text" value={fabric} onChange={e => setFabric(e.target.value)}
                placeholder="Or type a custom fabric name…"
                className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Yards *</label>
                <input type="number" step="0.25" value={yards} onChange={e => setYards(e.target.value)} placeholder="0"
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Rate / Yard (PKR)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Optional"
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
            </div>

            {yards && rate && (
              <div className="text-right text-sm font-bold text-ak-900">Value: {pkr(Number(yards) * Number(rate))}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Supplier</label>
                <input type="text" value={stockSupplier} onChange={e => setStockSupplier(e.target.value)} placeholder="Optional"
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Note</label>
                <input type="text" value={stockNote} onChange={e => setStockNote(e.target.value)} placeholder="e.g. Existing stock"
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-ak-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-ak-800 transition-all disabled:opacity-50">
              {saving ? 'Adding…' : 'Add Stock'}
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
