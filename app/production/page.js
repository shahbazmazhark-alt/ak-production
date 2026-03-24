'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, STAGES, SIZES, today, can } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/components/AuthProvider'

const PURPOSES = ['Stock', 'Sample', 'Online Order', 'Mixed']
const SPLIT_AFTER = 'Dyeing'

function getPresetRange(preset) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate()
  const day = now.getDay()
  switch (preset) {
    case 'week': {
      const mon = new Date(now); mon.setDate(d - (day === 0 ? 6 : day - 1))
      const sat = new Date(mon); sat.setDate(mon.getDate() + 6)
      return [mon.toISOString().slice(0,10), sat.toISOString().slice(0,10)]
    }
    case 'month': return [`${y}-${String(m+1).padStart(2,'0')}-01`, now.toISOString().slice(0,10)]
    case 'ytd': return [`${y}-01-01`, now.toISOString().slice(0,10)]
    default: return ['', '']
  }
}

export default function ProductionPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [view, setView] = useState('kanban')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [cards, setCards] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

  // Date filter
  const [datePreset, setDatePreset] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // New order form
  const [searchTerm, setSearchTerm] = useState('')
  const [selProduct, setSelProduct] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [purpose, setPurpose] = useState('Stock')
  const [orderRef, setOrderRef] = useState('')
  const [master, setMaster] = useState('')
  const [fabricYards, setFabricYards] = useState('')
  const [qty, setQty] = useState({ XS: 0, S: 0, M: 0, L: 0 })
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Split modal
  const [splitOrder, setSplitOrder] = useState(null)
  const [splitQty, setSplitQty] = useState({ XS: 0, S: 0, M: 0, L: 0 })

  // Delete confirmation
  const [confirmDel, setConfirmDel] = useState(null)

  // Inline card edit
  const [editingId, setEditingId] = useState(null)
  const [editSize, setEditSize] = useState('')
  const [editMaster, setEditMaster] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [pRes, oRes, cRes, wRes] = await Promise.all([
      supabase.from('products').select('*').eq('is_active', true).order('name'),
      supabase.from('production_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('unit_cards').select('*').order('created_at', { ascending: false }),
      supabase.from('workers').select('id, name, role').eq('is_active', true).order('name'),
    ])
    setProducts(pRes.data || [])
    setOrders(oRes.data || [])
    setCards(cRes.data || [])
    setWorkers(wRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Apply date preset
  function applyPreset(p) {
    setDatePreset(p)
    if (p === 'all') { setDateFrom(''); setDateTo('') }
    else if (p !== 'custom') { const [f, t] = getPresetRange(p); setDateFrom(f); setDateTo(t) }
  }

  // Filter orders/cards by date range
  const filteredOrders = useMemo(() => {
    if (!dateFrom && !dateTo) return orders
    return orders.filter(o => {
      const d = o.order_date || o.created_at?.slice(0, 10)
      if (!d) return true
      if (dateFrom && d < dateFrom) return false
      if (dateTo && d > dateTo) return false
      return true
    })
  }, [orders, dateFrom, dateTo])

  const filteredCards = useMemo(() => {
    if (!dateFrom && !dateTo) return cards
    const orderIds = new Set(filteredOrders.map(o => o.id))
    return cards.filter(c => !c.order_id || orderIds.has(c.order_id))
  }, [cards, filteredOrders, dateFrom, dateTo])

  // Searchable product list
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    const q = searchTerm.toLowerCase()
    return products.filter(p =>
      p.name?.toLowerCase().includes(q) || p.base_sku?.toLowerCase().includes(q) ||
      p.collection?.toLowerCase().includes(q) || p.label?.toLowerCase().includes(q)
    )
  }, [products, searchTerm])

  const masters = workers.filter(w => w.role?.toLowerCase().includes('stitch') || w.role?.toLowerCase().includes('master'))
  const masterList = masters.length > 0 ? masters : workers

  function selectProduct(p) { setSelProduct(p); setSearchTerm(p.label || (p.name + ' - ' + p.type)); setShowDropdown(false) }

  // ── CREATE ORDER ──
  async function createOrder(e) {
    e.preventDefault()
    if (!selProduct) return toast('Select a product', 'error')
    const totalUnits = Object.values(qty).reduce((a, b) => a + Number(b), 0)
    if (totalUnits === 0) return toast('Enter quantities', 'error')
    setSaving(true)
    try {
      const product = selProduct
      const firstStage = product?.production_path?.[0] || STAGES[0]
      const { data: order, error } = await supabase.from('production_orders').insert({
        product_id: product.id, product_label: product.label || (product.name + ' - ' + product.type),
        product_name: product.name, base_sku: product.base_sku, purpose,
        master: master || null, order_date: today(), sizes: qty, total_units: totalUnits,
        current_stage: firstStage, stitch_rate: product.stitch_rate || 0, gross_cost: 0,
        shopify_order_name: (purpose === 'Online Order' || purpose === 'Mixed') ? orderRef : null,
        notes: notes || null, fabric_yards: fabricYards ? { total: Number(fabricYards) } : null,
        is_split: false, created_by: user?.id || null,
      }).select().single()
      if (error) throw error

      const splitIndex = (product.production_path || STAGES).indexOf(SPLIT_AFTER)
      const needsSplit = splitIndex >= 0 && splitIndex < (product.production_path || STAGES).length - 1
      if (!needsSplit) {
        const ci = []
        for (const size of SIZES) { const n = Number(qty[size]); for (let i = 0; i < n; i++) ci.push({
          order_id: order.id, product_id: product.id, product_label: product.label || (product.name + ' - ' + product.type),
          full_sku: (product.base_sku || '') + '/' + size, size, purpose, master: master || null,
          current_stage: firstStage, stitch_rate: product.stitch_rate || 0, gross_cost: 0,
        }) }
        if (ci.length > 0) await supabase.from('unit_cards').insert(ci)
        await supabase.from('production_orders').update({ is_split: true }).eq('id', order.id)
      }

      toast('Order created — ' + totalUnits + ' units', 'success')
      setSelProduct(null); setSearchTerm(''); setPurpose('Stock'); setMaster('')
      setQty({ XS: 0, S: 0, M: 0, L: 0 }); setNotes(''); setOrderRef(''); setFabricYards('')
      setView('kanban'); load()
    } catch (err) { toast(err.message || 'Error', 'error') }
    finally { setSaving(false) }
  }

  // ── MOVE CARD FORWARD ──
  async function moveCard(card, direction = 1) {
    const product = products.find(p => p.id === card.product_id)
    const path = product?.production_path || STAGES
    const idx = path.indexOf(card.current_stage)
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= path.length) return toast(direction > 0 ? 'Already at last stage' : 'Already at first stage', 'error')
    const nextStage = path[newIdx]

    setCards(prev => prev.map(c => c.id === card.id ? { ...c, current_stage: nextStage } : c))
    toast((direction > 0 ? '→ ' : '← ') + nextStage, 'success')

    const { error } = await supabase.from('unit_cards')
      .update({ current_stage: nextStage, updated_at: new Date().toISOString() }).eq('id', card.id)
    if (error) {
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, current_stage: card.current_stage } : c))
      toast('Failed: ' + error.message, 'error'); return
    }
    try { await supabase.from('stage_history').insert({
      order_id: card.order_id, unit_card_id: card.id,
      stage: nextStage, action: direction > 0 ? 'moved' : 'moved_back', moved_by: user?.id || null,
    }) } catch {}
  }

  // ── MOVE ORDER (BATCH) ──
  async function moveOrder(order, direction = 1) {
    const product = products.find(p => p.id === order.product_id)
    const path = product?.production_path || STAGES
    const idx = path.indexOf(order.current_stage)
    const newIdx = idx + direction
    if (newIdx < 0 || newIdx >= path.length) return
    const nextStage = path[newIdx]

    // Split modal when moving forward past Dyeing
    if (direction > 0 && (order.current_stage === SPLIT_AFTER || (idx > 0 && path[idx] === SPLIT_AFTER))) {
      const sizes = order.sizes || {}
      setSplitQty({ XS: Number(sizes.XS || 0), S: Number(sizes.S || 0), M: Number(sizes.M || 0), L: Number(sizes.L || 0) })
      setSplitOrder({ ...order, _nextStage: nextStage })
      return
    }

    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, current_stage: nextStage } : o))
    toast((direction > 0 ? '→ ' : '← ') + nextStage, 'success')

    const { error } = await supabase.from('production_orders')
      .update({ current_stage: nextStage, updated_at: new Date().toISOString() }).eq('id', order.id)
    if (error) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, current_stage: order.current_stage } : o))
      toast('Failed: ' + error.message, 'error')
    }
  }

  // ── CONFIRM SPLIT ──
  async function confirmSplit() {
    if (!splitOrder) return
    const order = splitOrder, nextStage = order._nextStage
    const totalUnits = Object.values(splitQty).reduce((a, b) => a + Number(b), 0)
    if (totalUnits === 0) return toast('Enter at least 1 unit', 'error')
    setSplitOrder(null)
    toast('Splitting…', 'info')

    const ci = []
    for (const size of SIZES) { const n = Number(splitQty[size] || 0); for (let i = 0; i < n; i++) ci.push({
      order_id: order.id, product_id: order.product_id, product_label: order.product_label,
      full_sku: (order.base_sku || '') + '/' + size, size, purpose: order.purpose, master: order.master || null,
      current_stage: nextStage, stitch_rate: order.stitch_rate || 0, gross_cost: 0,
    }) }
    if (ci.length > 0) await supabase.from('unit_cards').insert(ci)
    await supabase.from('production_orders').update({
      current_stage: nextStage, is_split: true, sizes: splitQty, total_units: totalUnits,
      updated_at: new Date().toISOString(),
    }).eq('id', order.id)
    toast('Split into ' + ci.length + ' unit cards → ' + nextStage, 'success')
    load()
  }

  // ── DELETE ──
  async function deleteItem(item) {
    if (item.type === 'order') {
      // Delete all related unit cards first, then the order
      await supabase.from('unit_cards').delete().eq('order_id', item.id)
      await supabase.from('production_orders').delete().eq('id', item.id)
      setOrders(prev => prev.filter(o => o.id !== item.id))
      setCards(prev => prev.filter(c => c.order_id !== item.id))
    } else {
      await supabase.from('unit_cards').delete().eq('id', item.id)
      setCards(prev => prev.filter(c => c.id !== item.id))
    }
    setConfirmDel(null)
    toast('Deleted', 'success')
  }

  // ── INLINE EDIT ──
  function startEditCard(item) {
    if (editingId === item.id) { setEditingId(null); return }
    setEditingId(item.id)
    setEditSize(item.isBatch ? '' : (item.size || 'M'))
    setEditMaster(item.master || '')
  }

  async function saveCardEdit(item) {
    if (item.isBatch) {
      const updates = { master: editMaster || null, updated_at: new Date().toISOString() }
      const { error } = await supabase.from('production_orders').update(updates).eq('id', item.id)
      if (error) return toast(error.message, 'error')
      setOrders(prev => prev.map(o => o.id === item.id ? { ...o, ...updates } : o))
      // Also update master on all child unit cards
      await supabase.from('unit_cards').update({ master: editMaster || null }).eq('order_id', item.id)
      setCards(prev => prev.map(c => c.order_id === item.id ? { ...c, master: editMaster || null } : c))
    } else {
      const newSku = (item.full_sku || '').replace(/\/[A-Z]+$/, '') + '/' + editSize
      const updates = { size: editSize, full_sku: newSku, master: editMaster || null, updated_at: new Date().toISOString() }
      const { error } = await supabase.from('unit_cards').update(updates).eq('id', item.id)
      if (error) return toast(error.message, 'error')
      setCards(prev => prev.map(c => c.id === item.id ? { ...c, ...updates } : c))
    }
    setEditingId(null)
    toast('Updated', 'success')
  }

  // ── KANBAN DATA ──
  const kanbanItems = useMemo(() => {
    const byStage = {}
    STAGES.forEach(s => byStage[s] = [])
    filteredOrders.filter(o => !o.is_split).forEach(o => {
      if (byStage[o.current_stage]) byStage[o.current_stage].push({ ...o, isBatch: true, type: 'order' })
    })
    filteredCards.forEach(c => { if (byStage[c.current_stage]) byStage[c.current_stage].push({ ...c, isBatch: false, type: 'card' }) })
    return byStage
  }, [filteredOrders, filteredCards])

  const allItems = useMemo(() => {
    const items = []
    filteredOrders.filter(o => !o.is_split).forEach(o => items.push({ ...o, type: 'order', isBatch: true }))
    filteredCards.forEach(c => items.push({ ...c, type: 'card', isBatch: false }))
    return items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  }, [filteredOrders, filteredCards])

  const stageColors = {
    'Fabric Cut': 'border-l-amber-500 bg-amber-50', 'Dyeing': 'border-l-blue-500 bg-blue-50',
    'Adda': 'border-l-purple-500 bg-purple-50', 'Computer Embroidery': 'border-l-cyan-500 bg-cyan-50',
    'Hand Embroidery': 'border-l-pink-500 bg-pink-50', 'Stitching': 'border-l-orange-500 bg-orange-50',
    'QC': 'border-l-yellow-500 bg-yellow-50', 'Packed': 'border-l-emerald-500 bg-emerald-50',
    'Dispatched': 'border-l-green-600 bg-green-50',
  }

  const canEdit = can(user, 'canEdit', 'production')

  return (
    <AppShell>
      {/* ── SPLIT MODAL ── */}
      {splitOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]" onClick={() => setSplitOrder(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-ink-900 mb-1">Confirm Size Breakdown</h3>
            <p className="text-xs text-ink-400 mb-1">
              <span className="font-bold text-ink-700">{splitOrder.product_label}</span> → <span className="font-bold text-ak-900">{splitOrder._nextStage}</span>
            </p>
            <p className="text-xs text-ink-400 mb-4">Adjust quantities if the actual cut differs from plan.</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {SIZES.map(s => (
                <div key={s}>
                  <div className="text-[0.65rem] font-bold text-ink-500 text-center mb-1">{s}</div>
                  <input type="number" min="0" value={splitQty[s]}
                    onChange={e => setSplitQty(q => ({ ...q, [s]: Number(e.target.value) || 0 }))}
                    className="w-full text-center border border-sand-300 rounded-lg py-2.5 text-sm font-bold text-ink-800 bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
                </div>
              ))}
            </div>
            <div className="text-right text-xs font-bold text-ink-400 mb-4">
              Total: {Object.values(splitQty).reduce((a, b) => a + Number(b), 0)} units
              {splitOrder.total_units && <span className="text-ink-300 ml-2">(was {splitOrder.total_units})</span>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSplitOrder(null)} className="flex-1 py-2.5 text-sm font-bold text-ink-500 bg-sand-100 rounded-xl hover:bg-sand-200">Cancel</button>
              <button onClick={confirmSplit} className="flex-1 py-2.5 text-sm font-bold text-white bg-ak-900 rounded-xl hover:bg-ak-800">Split & Move →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]" onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-ink-900 mb-2">Delete {confirmDel.isBatch ? 'Order' : 'Unit Card'}?</h3>
            <p className="text-sm text-ink-400 mb-1">{confirmDel.product_label}</p>
            {confirmDel.isBatch && <p className="text-xs text-red-600 mb-4">This will also delete all unit cards under this order.</p>}
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2.5 text-sm font-bold text-ink-500 bg-sand-100 rounded-xl hover:bg-sand-200">Cancel</button>
              <button onClick={() => deleteItem(confirmDel)} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Production</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">
            {filteredOrders.filter(o => !o.is_split).length} batches · {filteredCards.length} unit cards
          </p>
        </div>
        <div className="flex gap-1 bg-sand-100 p-1 rounded-xl">
          {[['kanban','Board'], ['list','List'], ...(canEdit ? [['new','+ New']] : [])].map(([k, l]) => (
            <button key={k} onClick={() => setView(k)}
              className={'px-4 py-2 text-xs font-bold rounded-lg transition-all ' + (view === k ? 'bg-white shadow text-ink-900' : 'text-ink-400 hover:text-ink-600')}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* ── DATE FILTER ── */}
      {view !== 'new' && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {[['all','All'], ['week','This Week'], ['month','This Month'], ['ytd','YTD'], ['custom','Custom']].map(([k, l]) => (
            <button key={k} onClick={() => applyPreset(k)}
              className={'px-3 py-1.5 text-xs font-bold rounded-lg transition-all ' + (datePreset === k ? 'bg-ak-900 text-white' : 'bg-sand-100 text-ink-400 hover:text-ink-600')}
            >{l}</button>
          ))}
          {(datePreset === 'custom' || dateFrom) && (
            <>
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setDatePreset('custom') }}
                className="border border-sand-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              <span className="text-xs text-ink-400">to</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setDatePreset('custom') }}
                className="border border-sand-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : view === 'kanban' ? (
        /* ── KANBAN ── */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <div key={stage} className="kanban-col">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-[0.65rem] font-bold tracking-[0.12em] text-ink-400 uppercase">{stage}</h3>
                <span className="text-[0.6rem] font-bold text-ink-300 bg-sand-200 px-1.5 py-0.5 rounded-full">{kanbanItems[stage]?.length || 0}</span>
              </div>
              <div className="space-y-2">
                {(kanbanItems[stage] || []).length === 0 && (
                  <div className="text-xs text-ink-300 text-center py-6 border border-dashed border-sand-300 rounded-xl">Empty</div>
                )}
                {(kanbanItems[stage] || []).map(item => (
                  <div key={item.id} className={'border-l-4 ' + (stageColors[stage] || 'border-l-gray-400 bg-gray-50') + ' rounded-xl p-3 shadow-sm'}>
                    {/* Card header — click to edit */}
                    <div className={canEdit ? 'cursor-pointer' : ''} onClick={() => canEdit && startEditCard(item)}>
                      <div className="text-sm font-bold text-ink-800 leading-tight">{item.product_label || '—'}</div>
                      {item.isBatch ? (
                        <>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[0.65rem] font-bold text-white bg-ak-900 px-2 py-0.5 rounded">BATCH</span>
                            <span className="text-[0.6rem] text-ink-400">{item.total_units} units</span>
                            {item.fabric_yards?.total && <span className="text-[0.6rem] text-ink-400">{item.fabric_yards.total} yds</span>}
                          </div>
                          {item.shopify_order_name && <div className="text-[0.6rem] text-blue-600 mt-1">#{item.shopify_order_name}</div>}
                          {item.master && <div className="text-[0.6rem] text-ink-300 mt-0.5">{item.master}</div>}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[0.65rem] font-bold text-ink-400 bg-white px-1.5 py-0.5 rounded">{item.size}</span>
                            {item.master && <span className="text-[0.6rem] text-ink-300">{item.master}</span>}
                          </div>
                          <div className="text-[0.6rem] text-ink-300 mt-1 font-mono">{item.full_sku}</div>
                        </>
                      )}
                    </div>

                    {/* Inline edit form */}
                    {editingId === item.id && canEdit && (
                      <div className="mt-2 pt-2 border-t border-sand-200 space-y-2" onClick={e => e.stopPropagation()}>
                        {!item.isBatch && (
                          <div>
                            <div className="text-[0.55rem] font-bold text-ink-400 uppercase mb-1">Size</div>
                            <div className="flex gap-1">
                              {SIZES.map(s => (
                                <button key={s} onClick={() => setEditSize(s)}
                                  className={'flex-1 py-1 text-[0.65rem] font-bold rounded-md border transition-all ' + (editSize === s ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{s}</button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-[0.55rem] font-bold text-ink-400 uppercase mb-1">Master</div>
                          <select value={editMaster} onChange={e => setEditMaster(e.target.value)}
                            className="w-full border border-sand-300 rounded-md px-2 py-1 text-[0.7rem] font-semibold bg-sand-50 focus:outline-none focus:ring-1 focus:ring-ak-900/20">
                            <option value="">None</option>
                            {masterList.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingId(null)} className="flex-1 text-[0.6rem] font-bold text-ink-400 bg-sand-100 rounded-md py-1.5">Cancel</button>
                          <button onClick={() => saveCardEdit(item)} className="flex-1 text-[0.6rem] font-bold text-white bg-ak-900 rounded-md py-1.5">Save</button>
                        </div>
                      </div>
                    )}

                    {/* Move/delete buttons */}
                    {canEdit && editingId !== item.id && (
                      <div className="flex gap-1 mt-2">
                        {STAGES.indexOf(stage) > 0 && (
                          <button onClick={() => item.isBatch ? moveOrder(item, -1) : moveCard(item, -1)}
                            className="flex-1 text-[0.65rem] font-bold text-ink-500 bg-sand-100 border border-sand-200 rounded-lg py-1.5 hover:bg-sand-200 transition-all">
                            ← Back
                          </button>
                        )}
                        {stage !== 'Dispatched' && (
                          <button onClick={() => item.isBatch ? moveOrder(item, 1) : moveCard(item, 1)}
                            className="flex-1 text-[0.65rem] font-bold text-ak-900 bg-white border border-ak-900/20 rounded-lg py-1.5 hover:bg-ak-100 transition-all">
                            {item.isBatch && item.current_stage === SPLIT_AFTER ? 'Split →' : 'Move →'}
                          </button>
                        )}
                        <button onClick={() => setConfirmDel(item)}
                          className="text-[0.65rem] font-bold text-red-400 hover:text-red-600 px-1.5 transition-colors" title="Delete">✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : view === 'list' ? (
        /* ── LIST VIEW ── */
        <div className="bg-white rounded-2xl border border-sand-200 p-5">
          {allItems.length === 0 ? (
            <p className="text-sm text-ink-300 py-8 text-center">No items{dateFrom ? ' in this date range' : ''}</p>
          ) : (
            <table className="ak-table">
              <thead><tr><th>Product</th><th>Type</th><th>Size</th><th>Stage</th><th>Purpose</th><th>Master</th><th>Order #</th><th>Date</th>{canEdit && <th className="text-right">Actions</th>}</tr></thead>
              <tbody>
                {allItems.map(item => (
                  <tr key={item.id}>
                    <td className="font-semibold">{item.product_label || '—'}</td>
                    <td><span className={'stage-badge ' + (item.isBatch ? 'bg-ak-100 text-ak-900' : 'bg-sand-200 text-ink-600')}>{item.isBatch ? 'Batch' : 'Unit'}</span></td>
                    <td>{item.isBatch ? (item.total_units + ' pcs') : item.size}</td>
                    <td><span className={'stage-badge ' + (item.current_stage === 'Dispatched' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>{item.current_stage}</span></td>
                    <td className="text-ink-400 text-sm">{item.purpose || '—'}</td>
                    <td className="text-ink-400 text-sm">{item.master || '—'}</td>
                    <td className="text-xs text-blue-600">{item.shopify_order_name || '—'}</td>
                    <td className="text-xs text-ink-400">{item.order_date || item.created_at?.slice(0, 10)}</td>
                    {canEdit && (
                      <td className="text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => item.isBatch ? moveOrder(item, -1) : moveCard(item, -1)} className="text-[0.6rem] font-bold bg-sand-100 text-ink-500 px-2 py-1 rounded-lg hover:bg-sand-200">←</button>
                          <button onClick={() => item.isBatch ? moveOrder(item, 1) : moveCard(item, 1)} className="text-[0.6rem] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-200">→</button>
                          <button onClick={() => setConfirmDel(item)} className="text-[0.6rem] font-bold bg-red-100 text-red-700 px-2 py-1 rounded-lg hover:bg-red-200">✕</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* ── NEW ORDER FORM ── */
        <div className="bg-white rounded-2xl border border-sand-200 p-6 max-w-lg">
          <h2 className="text-lg font-extrabold text-ink-900 mb-4">New Production Order</h2>
          <form onSubmit={createOrder} className="space-y-4">
            <div className="relative">
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Product</label>
              <input type="text" value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); setSelProduct(null) }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Type name, SKU, or collection…"
                className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-800 bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              {showDropdown && filteredProducts.length > 0 && !selProduct && (
                <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-sand-300 rounded-xl shadow-lg">
                  {filteredProducts.slice(0, 20).map(p => (
                    <button key={p.id} type="button" onClick={() => selectProduct(p)}
                      className="w-full text-left px-3 py-2 hover:bg-sand-50 text-sm border-b border-sand-100 last:border-0">
                      <span className="font-semibold text-ink-800">{p.name}</span>
                      <span className="text-ink-400"> — {p.type}</span>
                      <span className="text-[0.6rem] text-ink-300 ml-2">{p.base_sku}</span>
                      <span className="text-[0.55rem] text-ak-900 ml-2">{p.collection}</span>
                    </button>
                  ))}
                </div>
              )}
              {selProduct && <div className="text-xs text-emerald-700 font-semibold mt-1">✓ {selProduct.label}</div>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Purpose</label>
                <select value={purpose} onChange={e => setPurpose(e.target.value)}
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20">
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Master</label>
                <select value={master} onChange={e => setMaster(e.target.value)}
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20">
                  <option value="">Select…</option>
                  {masterList.map(w => <option key={w.id} value={w.name}>{w.name} — {w.role}</option>)}
                </select>
              </div>
            </div>

            {(purpose === 'Online Order' || purpose === 'Mixed') && (
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Order #</label>
                <input type="text" value={orderRef} onChange={e => setOrderRef(e.target.value)} placeholder="e.g. #1045"
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Fabric Yards (for cutting)</label>
              <input type="number" step="0.25" value={fabricYards} onChange={e => setFabricYards(e.target.value)} placeholder="Total yards"
                className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Quantities by Size</label>
              <div className="grid grid-cols-4 gap-3 mt-2">
                {SIZES.map(s => (
                  <div key={s}>
                    <div className="text-[0.65rem] font-bold text-ink-500 text-center mb-1">{s}</div>
                    <input type="number" min="0" value={qty[s]} onChange={e => setQty(q => ({ ...q, [s]: e.target.value }))}
                      className="w-full text-center border border-sand-300 rounded-lg py-2 text-sm font-bold text-ink-800 bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
                  </div>
                ))}
              </div>
              <div className="text-right text-xs font-bold text-ink-400 mt-2">Total: {Object.values(qty).reduce((a, b) => a + Number(b), 0)}</div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any additional notes…"
                className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20 resize-none" />
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-ak-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-ak-800 transition-all disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Order'}
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
