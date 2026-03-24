'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, STAGES, SIZES, today, can, pkr } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/components/AuthProvider'

const PURPOSES = ['Stock', 'Sample', 'Online Order', 'Mixed']
const SPLIT_AFTER = 'Dyeing'
const STAGE_WORKERS = {
  'Cutting': 'Dilshad', 'Dyeing': 'Amir',
  'Computer Embroidery': ['Sikandar', 'Shafeeq'], 'Hand Embroidery': ['Ashfaq', 'Honey'],
  'QC': 'Umer', 'Packed': 'Khizar', 'Dispatched': 'Khizar',
}
const DISPATCH_TYPES = ['Store Inventory', 'Online Order', 'Custom Order', 'Gifting', 'Sample']
const QC_OPTIONS = ['Pass', 'Fail', 'Rework']

function getPresetRange(p) {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate(), day = now.getDay()
  if (p === 'week') { const mon = new Date(now); mon.setDate(d - (day === 0 ? 6 : day - 1)); const sun = new Date(mon); sun.setDate(mon.getDate() + 6); return [mon.toISOString().slice(0,10), sun.toISOString().slice(0,10)] }
  if (p === 'month') return [`${y}-${String(m+1).padStart(2,'0')}-01`, now.toISOString().slice(0,10)]
  if (p === 'ytd') return [`${y}-01-01`, now.toISOString().slice(0,10)]
  return ['', '']
}
function daysUntil(ds) { if (!ds) return null; return Math.ceil((new Date(ds) - new Date()) / 86400000) }
function dueBadge(ds) {
  const d = daysUntil(ds); if (d === null) return null
  if (d < 0) return { t: Math.abs(d) + 'd late', c: 'bg-red-100 text-red-800' }
  if (d === 0) return { t: 'Due today', c: 'bg-amber-100 text-amber-800' }
  if (d <= 2) return { t: d + 'd left', c: 'bg-amber-100 text-amber-800' }
  return { t: d + 'd left', c: 'bg-emerald-100 text-emerald-800' }
}

export default function ProductionPage() {
  const toast = useToast(), { user } = useAuth()
  const [view, setView] = useState('kanban')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [cards, setCards] = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [datePreset, setDatePreset] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selProduct, setSelProduct] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [purpose, setPurpose] = useState('Stock')
  const [orderRef, setOrderRef] = useState('')
  const [master, setMaster] = useState('')
  const [fabricYards, setFabricYards] = useState('')
  const [qty, setQty] = useState({ XS: 0, S: 0, M: 0, L: 0 })
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [splitOrder, setSplitOrder] = useState(null)
  const [splitQty, setSplitQty] = useState({ XS: 0, S: 0, M: 0, L: 0 })
  const [confirmDel, setConfirmDel] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editSize, setEditSize] = useState('')
  const [editMaster, setEditMaster] = useState('')
  const [workerPick, setWorkerPick] = useState(null)
  const [dispatchModal, setDispatchModal] = useState(null)
  const [dispatchType, setDispatchType] = useState('Store Inventory')
  const [dispatchRef, setDispatchRef] = useState('')
  const [qcModal, setQcModal] = useState(null)
  const [qcResult, setQcResult] = useState('Pass')
  const [qcNotes, setQcNotes] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [pRes, oRes, cRes, wRes] = await Promise.all([
      supabase.from('products').select('*').eq('is_active', true).order('name'),
      supabase.from('production_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('unit_cards').select('*').order('created_at', { ascending: false }),
      supabase.from('workers').select('id, name, role').eq('is_active', true).order('name'),
    ])
    setProducts(pRes.data || []); setOrders(oRes.data || []); setCards(cRes.data || []); setWorkers(wRes.data || []); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  function applyPreset(p) { setDatePreset(p); if (p === 'all') { setDateFrom(''); setDateTo('') } else if (p !== 'custom') { const [f, t] = getPresetRange(p); setDateFrom(f); setDateTo(t) } }

  const filteredOrders = useMemo(() => { if (!dateFrom && !dateTo) return orders; return orders.filter(o => { const d = o.order_date || o.created_at?.slice(0,10); return (!d || true) && (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo) }) }, [orders, dateFrom, dateTo])
  const filteredCards = useMemo(() => { if (!dateFrom && !dateTo) return cards; const ids = new Set(filteredOrders.map(o => o.id)); return cards.filter(c => !c.order_id || ids.has(c.order_id)) }, [cards, filteredOrders, dateFrom, dateTo])
  const filteredProducts = useMemo(() => { if (!searchTerm) return products; const q = searchTerm.toLowerCase(); return products.filter(p => p.name?.toLowerCase().includes(q) || p.base_sku?.toLowerCase().includes(q) || p.collection?.toLowerCase().includes(q) || p.label?.toLowerCase().includes(q)) }, [products, searchTerm])

  const masters = workers.filter(w => w.role?.toLowerCase().includes('stitch') || w.role?.toLowerCase().includes('master'))
  const masterList = masters.length > 0 ? masters : workers
  function selectProduct(p) { setSelProduct(p); setSearchTerm(p.label || (p.name + ' - ' + p.type)); setShowDropdown(false) }

  function getDueDate(item) { if (item.due_date) return item.due_date; if (item.order_id) { const o = orders.find(x => x.id === item.order_id); return o?.due_date } return null }

  async function createOrder(e) {
    e.preventDefault()
    if (!selProduct) return toast('Select a product', 'error')
    const totalUnits = Object.values(qty).reduce((a, b) => a + Number(b), 0)
    if (totalUnits === 0) return toast('Enter quantities', 'error')
    setSaving(true)
    try {
      const product = selProduct, firstStage = product?.production_path?.[0] || STAGES[0], yds = fabricYards ? Number(fabricYards) : 0
      const firstWorker = typeof STAGE_WORKERS[firstStage] === 'string' ? STAGE_WORKERS[firstStage] : null
      const { data: order, error } = await supabase.from('production_orders').insert({
        product_id: product.id, product_label: product.label || (product.name + ' - ' + product.type),
        product_name: product.name, base_sku: product.base_sku, purpose,
        master: firstWorker, order_date: today(), sizes: qty, total_units: totalUnits,
        current_stage: firstStage, stitch_rate: product.stitch_rate || 0, gross_cost: 0,
        shopify_order_name: (purpose === 'Online Order' || purpose === 'Mixed') ? orderRef : null,
        notes: notes || null, fabric_yards: yds ? { total: yds } : null, is_split: false, created_by: user?.id || null, due_date: dueDate || null,
      }).select().single()
      if (error) throw error
      if (yds > 0 && firstStage === 'Cutting' && product.fabrics?.length > 0) {
        try { await supabase.from('fabric_usage_log').insert({ fabric: product.fabrics[0], yards: yds, type: 'Production Cut', product_label: product.label || product.name, date: today() }) } catch {}
      }
      const splitIndex = (product.production_path || STAGES).indexOf(SPLIT_AFTER)
      const needsSplit = splitIndex >= 0 && splitIndex < (product.production_path || STAGES).length - 1
      if (!needsSplit) {
        const ci = []; for (const size of SIZES) { const n = Number(qty[size]); for (let i = 0; i < n; i++) ci.push({ order_id: order.id, product_id: product.id, product_label: product.label || (product.name + ' - ' + product.type), full_sku: (product.base_sku || '') + '/' + size, size, purpose, master: firstWorker, current_stage: firstStage, stitch_rate: product.stitch_rate || 0, gross_cost: 0 }) }
        if (ci.length > 0) await supabase.from('unit_cards').insert(ci)
        await supabase.from('production_orders').update({ is_split: true }).eq('id', order.id)
      }
      toast('Order created — ' + totalUnits + ' units', 'success')
      setSelProduct(null); setSearchTerm(''); setPurpose('Stock'); setQty({ XS: 0, S: 0, M: 0, L: 0 }); setNotes(''); setOrderRef(''); setFabricYards(''); setDueDate(''); setView('kanban'); load()
    } catch (err) { toast(err.message || 'Error', 'error') } finally { setSaving(false) }
  }

  async function moveCard(card, dir = 1) {
    const product = products.find(p => p.id === card.product_id), path = product?.production_path || STAGES
    const idx = path.indexOf(card.current_stage), newIdx = idx + dir
    if (newIdx < 0 || newIdx >= path.length) return toast(dir > 0 ? 'Last stage' : 'First stage', 'error')
    const ns = path[newIdx]
    if (dir > 0 && ns === 'Dispatched') { setDispatchModal({ item: card, nextStage: ns }); setDispatchType('Store Inventory'); setDispatchRef(''); return }
    if (dir > 0 && card.current_stage === 'QC') { setQcModal({ item: card, nextStage: ns }); setQcResult('Pass'); setQcNotes(''); return }
    if (dir > 0 && Array.isArray(STAGE_WORKERS[ns])) { setWorkerPick({ item: card, direction: dir, nextStage: ns, workers: STAGE_WORKERS[ns] }); return }
    // Forward: auto-assign single default. Back: assign target stage's default (or null)
    const aw = dir > 0
      ? (typeof STAGE_WORKERS[ns] === 'string' ? STAGE_WORKERS[ns] : null)
      : (typeof STAGE_WORKERS[ns] === 'string' ? STAGE_WORKERS[ns] : null)
    await doMoveCard(card, ns, dir, aw)
  }
  async function doMoveCard(card, ns, dir, aw, extra = {}) {
    const u = { current_stage: ns, updated_at: new Date().toISOString(), ...extra }; if (aw !== null) u.master = aw
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, current_stage: ns, ...(aw !== null ? { master: aw } : {}), ...extra } : c))
    toast((dir > 0 ? '→ ' : '← ') + ns + (aw ? ' (' + aw + ')' : ''), 'success')
    const { error } = await supabase.from('unit_cards').update(u).eq('id', card.id)
    if (error) { setCards(prev => prev.map(c => c.id === card.id ? { ...c, current_stage: card.current_stage, master: card.master } : c)); toast('Failed', 'error'); return }
    try { await supabase.from('stage_history').insert({ order_id: card.order_id, unit_card_id: card.id, stage: ns, action: dir > 0 ? 'moved' : 'moved_back', moved_by: user?.id || null }) } catch {}
  }

  async function moveOrder(order, dir = 1) {
    const product = products.find(p => p.id === order.product_id), path = product?.production_path || STAGES
    const idx = path.indexOf(order.current_stage), newIdx = idx + dir
    if (newIdx < 0 || newIdx >= path.length) return
    const ns = path[newIdx]
    if (dir > 0 && (order.current_stage === SPLIT_AFTER || path[idx] === SPLIT_AFTER)) { const sizes = order.sizes || {}; setSplitQty({ XS: Number(sizes.XS||0), S: Number(sizes.S||0), M: Number(sizes.M||0), L: Number(sizes.L||0) }); setSplitOrder({ ...order, _nextStage: ns }); return }
    if (dir > 0 && ns === 'Dispatched') { setDispatchModal({ item: { ...order, isBatch: true, type: 'order' }, nextStage: ns }); setDispatchType('Store Inventory'); setDispatchRef(''); return }
    if (dir > 0 && Array.isArray(STAGE_WORKERS[ns])) { setWorkerPick({ item: { ...order, isBatch: true, type: 'order' }, direction: dir, nextStage: ns, workers: STAGE_WORKERS[ns] }); return }
    const aw = typeof STAGE_WORKERS[ns] === 'string' ? STAGE_WORKERS[ns] : null
    await doMoveOrder(order, ns, dir, aw)
  }
  async function doMoveOrder(order, ns, dir, aw, extra = {}) {
    const u = { current_stage: ns, updated_at: new Date().toISOString(), ...extra }; if (aw !== null) u.master = aw
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, current_stage: ns, ...(aw !== null ? { master: aw } : {}), ...extra } : o))
    toast((dir > 0 ? '→ ' : '← ') + ns + (aw ? ' (' + aw + ')' : ''), 'success')
    const { error } = await supabase.from('production_orders').update(u).eq('id', order.id)
    if (error) { setOrders(prev => prev.map(o => o.id === order.id ? { ...o, current_stage: order.current_stage } : o)); toast('Failed', 'error') }
  }

  async function pickWorkerAndMove(w) { if (!workerPick) return; const { item, direction: dir, nextStage: ns } = workerPick; setWorkerPick(null); if (item.type === 'order' || item.isBatch) await doMoveOrder(item, ns, dir, w); else await doMoveCard(item, ns, dir, w) }

  async function confirmSplit() {
    if (!splitOrder) return; const order = splitOrder, ns = order._nextStage, tu = Object.values(splitQty).reduce((a, b) => a + Number(b), 0)
    if (tu === 0) return toast('Enter at least 1 unit', 'error'); setSplitOrder(null); toast('Splitting…', 'info')
    const ci = []; for (const size of SIZES) { const n = Number(splitQty[size]||0); for (let i = 0; i < n; i++) ci.push({ order_id: order.id, product_id: order.product_id, product_label: order.product_label, full_sku: (order.base_sku||'') + '/' + size, size, purpose: order.purpose, master: order.master || null, current_stage: ns, stitch_rate: order.stitch_rate || 0, gross_cost: 0 }) }
    if (ci.length > 0) await supabase.from('unit_cards').insert(ci)
    await supabase.from('production_orders').update({ current_stage: ns, is_split: true, sizes: splitQty, total_units: tu, updated_at: new Date().toISOString() }).eq('id', order.id)
    toast('Split → ' + ns, 'success'); load()
  }

  async function confirmDispatch() {
    if (!dispatchModal) return; const { item, nextStage: ns } = dispatchModal; const dest = dispatchType + (dispatchRef ? ': ' + dispatchRef : ''); setDispatchModal(null)
    if (item.type === 'order' || item.isBatch) { await doMoveOrder(item, ns, 1, 'Khizar', { dispatch_destination: dest }); await supabase.from('unit_cards').update({ current_stage: ns, dispatch_destination: dest, updated_at: new Date().toISOString() }).eq('order_id', item.id) }
    else await doMoveCard(item, ns, 1, 'Khizar', { dispatch_destination: dest })
  }

  async function confirmQC() {
    if (!qcModal) return; const { item, nextStage: ns } = qcModal; setQcModal(null)
    if (qcResult === 'Pass') { const aw = typeof STAGE_WORKERS[ns] === 'string' ? STAGE_WORKERS[ns] : null; await doMoveCard(item, ns, 1, aw, { qc_status: 'pass', qc_notes: qcNotes || null }) }
    else if (qcResult === 'Fail') { await supabase.from('unit_cards').update({ qc_status: 'fail', qc_notes: qcNotes || 'Failed QC', updated_at: new Date().toISOString() }).eq('id', item.id); setCards(prev => prev.map(c => c.id === item.id ? { ...c, qc_status: 'fail', qc_notes: qcNotes } : c)); toast('QC Failed', 'error') }
    else { const product = products.find(p => p.id === item.product_id); const path = product?.production_path || STAGES; const si = path.indexOf('Stitching'); const rs = si >= 0 ? 'Stitching' : path[Math.max(0, path.indexOf('QC') - 1)]; await doMoveCard(item, rs, -1, null, { qc_status: 'rework', qc_notes: qcNotes || 'Rework' }) }
  }

  async function deleteItem(item) {
    if (item.type === 'order') { await supabase.from('unit_cards').delete().eq('order_id', item.id); await supabase.from('production_orders').delete().eq('id', item.id); setOrders(prev => prev.filter(o => o.id !== item.id)); setCards(prev => prev.filter(c => c.order_id !== item.id)) }
    else { await supabase.from('unit_cards').delete().eq('id', item.id); setCards(prev => prev.filter(c => c.id !== item.id)) }
    setConfirmDel(null); toast('Deleted', 'success')
  }

  function startEditCard(item) { if (editingId === item.id) { setEditingId(null); return }; setEditingId(item.id); setEditSize(item.isBatch ? '' : (item.size || 'M')); setEditMaster(item.master || '') }
  async function saveCardEdit(item) {
    if (item.isBatch) { const u = { master: editMaster || null, updated_at: new Date().toISOString() }; await supabase.from('production_orders').update(u).eq('id', item.id); setOrders(prev => prev.map(o => o.id === item.id ? { ...o, ...u } : o)); await supabase.from('unit_cards').update({ master: editMaster || null }).eq('order_id', item.id); setCards(prev => prev.map(c => c.order_id === item.id ? { ...c, master: editMaster || null } : c)) }
    else { const ns = (item.full_sku || '').replace(/\/[A-Z]+$/, '') + '/' + editSize; const u = { size: editSize, full_sku: ns, master: editMaster || null, updated_at: new Date().toISOString() }; await supabase.from('unit_cards').update(u).eq('id', item.id); setCards(prev => prev.map(c => c.id === item.id ? { ...c, ...u } : c)) }
    setEditingId(null); toast('Updated', 'success')
  }

  const kanbanItems = useMemo(() => { const s = {}; STAGES.forEach(x => s[x] = []); filteredOrders.filter(o => !o.is_split).forEach(o => { if (s[o.current_stage]) s[o.current_stage].push({ ...o, isBatch: true, type: 'order' }) }); filteredCards.forEach(c => { if (s[c.current_stage]) s[c.current_stage].push({ ...c, isBatch: false, type: 'card' }) }); return s }, [filteredOrders, filteredCards])
  const allItems = useMemo(() => { const i = []; filteredOrders.filter(o => !o.is_split).forEach(o => i.push({ ...o, type: 'order', isBatch: true })); filteredCards.forEach(c => i.push({ ...c, type: 'card', isBatch: false })); return i.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')) }, [filteredOrders, filteredCards])

  const sc = { 'Cutting': 'border-l-amber-500 bg-amber-50', 'Dyeing': 'border-l-blue-500 bg-blue-50', 'Adda Work': 'border-l-purple-500 bg-purple-50', 'Computer Embroidery': 'border-l-cyan-500 bg-cyan-50', 'Hand Embroidery': 'border-l-pink-500 bg-pink-50', 'Stitching': 'border-l-orange-500 bg-orange-50', 'QC': 'border-l-yellow-500 bg-yellow-50', 'Packed': 'border-l-emerald-500 bg-emerald-50', 'Dispatched': 'border-l-green-600 bg-green-50' }
  const canE = can(user, 'canEdit', 'production')

  return (
    <AppShell>
      {splitOrder && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]" onClick={() => setSplitOrder(null)}><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-ink-900 mb-1">Confirm size breakdown</h3>
        <p className="text-xs text-ink-400 mb-4"><span className="font-bold text-ink-700">{splitOrder.product_label}</span> → <span className="font-bold text-ak-900">{splitOrder._nextStage}</span></p>
        <div className="grid grid-cols-4 gap-3 mb-4">{SIZES.map(s => (<div key={s}><div className="text-[0.65rem] font-bold text-ink-500 text-center mb-1">{s}</div><input type="number" min="0" value={splitQty[s]} onChange={e => setSplitQty(q => ({ ...q, [s]: Number(e.target.value) || 0 }))} className="w-full text-center border border-sand-300 rounded-lg py-2.5 text-sm font-bold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>))}</div>
        <div className="text-right text-xs font-bold text-ink-400 mb-4">Total: {Object.values(splitQty).reduce((a, b) => a + Number(b), 0)}{splitOrder.total_units && <span className="text-ink-300 ml-2">(was {splitOrder.total_units})</span>}</div>
        <div className="flex gap-3"><button onClick={() => setSplitOrder(null)} className="flex-1 py-2.5 text-sm font-bold text-ink-500 bg-sand-100 rounded-xl">Cancel</button><button onClick={confirmSplit} className="flex-1 py-2.5 text-sm font-bold text-white bg-ak-900 rounded-xl hover:bg-ak-800">Split & Move →</button></div>
      </div></div>)}

      {dispatchModal && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]" onClick={() => setDispatchModal(null)}><div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-ink-900 mb-1">Dispatch destination</h3>
        <p className="text-xs text-ink-400 mb-4"><span className="font-bold text-ink-700">{dispatchModal.item.product_label}</span></p>
        <div className="space-y-3 mb-4">
          <div className="flex flex-wrap gap-2">{DISPATCH_TYPES.map(t => (<button key={t} onClick={() => setDispatchType(t)} className={'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ' + (dispatchType === t ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{t}</button>))}</div>
          {(dispatchType === 'Online Order' || dispatchType === 'Custom Order') && (<input type="text" value={dispatchRef} onChange={e => setDispatchRef(e.target.value)} placeholder={dispatchType === 'Online Order' ? 'Order # (e.g. #1045)' : 'Customer name or details'} className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />)}
        </div>
        <div className="flex gap-3"><button onClick={() => setDispatchModal(null)} className="flex-1 py-2.5 text-sm font-bold text-ink-500 bg-sand-100 rounded-xl">Cancel</button><button onClick={confirmDispatch} className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700">Dispatch →</button></div>
      </div></div>)}

      {qcModal && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]" onClick={() => setQcModal(null)}><div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-ink-900 mb-1">QC result</h3>
        <p className="text-xs text-ink-400 mb-4"><span className="font-bold text-ink-700">{qcModal.item.product_label}</span> — {qcModal.item.size}</p>
        <div className="flex gap-2 mb-4">{QC_OPTIONS.map(o => (<button key={o} onClick={() => setQcResult(o)} className={'flex-1 py-2.5 text-sm font-bold rounded-xl border-2 transition-all ' + (qcResult === o ? o === 'Pass' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : o === 'Fail' ? 'border-red-500 bg-red-50 text-red-800' : 'border-amber-500 bg-amber-50 text-amber-800' : 'border-sand-200 text-ink-400')}>{o}</button>))}</div>
        {(qcResult === 'Fail' || qcResult === 'Rework') && (<textarea value={qcNotes} onChange={e => setQcNotes(e.target.value)} rows={2} placeholder={qcResult === 'Fail' ? 'What went wrong?' : 'What needs rework?'} className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-ak-900/20" />)}
        <div className="flex gap-3"><button onClick={() => setQcModal(null)} className="flex-1 py-2.5 text-sm font-bold text-ink-500 bg-sand-100 rounded-xl">Cancel</button><button onClick={confirmQC} className={'flex-1 py-2.5 text-sm font-bold text-white rounded-xl ' + (qcResult === 'Pass' ? 'bg-emerald-600' : qcResult === 'Fail' ? 'bg-red-600' : 'bg-amber-600')}>{qcResult === 'Pass' ? 'Pass → Packed' : qcResult === 'Fail' ? 'Mark Failed' : 'Send to Rework'}</button></div>
      </div></div>)}

      {workerPick && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]" onClick={() => setWorkerPick(null)}><div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-ink-900 mb-1">Assign worker</h3>
        <p className="text-xs text-ink-400 mb-4">Moving to <span className="font-bold text-ak-900">{workerPick.nextStage}</span></p>
        <div className="space-y-2">{workerPick.workers.map(w => (<button key={w} onClick={() => pickWorkerAndMove(w)} className="w-full py-3 text-sm font-bold text-ink-800 bg-sand-50 border border-sand-200 rounded-xl hover:bg-ak-100 transition-all">{w}</button>))}</div>
        <button onClick={() => setWorkerPick(null)} className="w-full mt-3 py-2 text-xs font-bold text-ink-400 bg-sand-100 rounded-xl">Cancel</button>
      </div></div>)}

      {confirmDel && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]" onClick={() => setConfirmDel(null)}><div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold text-ink-900 mb-2">Delete {confirmDel.isBatch ? 'order' : 'unit card'}?</h3>
        <p className="text-sm text-ink-400 mb-1">{confirmDel.product_label}</p>
        {confirmDel.isBatch && <p className="text-xs text-red-600 mb-4">Deletes all unit cards too.</p>}
        <div className="flex gap-3"><button onClick={() => setConfirmDel(null)} className="flex-1 py-2.5 text-sm font-bold text-ink-500 bg-sand-100 rounded-xl">Cancel</button><button onClick={() => deleteItem(confirmDel)} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl">Delete</button></div>
      </div></div>)}

      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-2xl font-extrabold text-ink-900">Production</h1><p className="text-sm text-ink-400 font-semibold mt-0.5">{filteredOrders.filter(o => !o.is_split).length} batches · {filteredCards.length} cards</p></div>
        <div className="flex gap-1 bg-sand-100 p-1 rounded-xl">{[['kanban','Board'], ['list','List'], ...(canE ? [['new','+ New']] : [])].map(([k, l]) => (<button key={k} onClick={() => setView(k)} className={'px-4 py-2 text-xs font-bold rounded-lg transition-all ' + (view === k ? 'bg-white shadow text-ink-900' : 'text-ink-400')}>{l}</button>))}</div>
      </div>

      {view !== 'new' && (<div className="flex flex-wrap items-center gap-2 mb-5">
        {[['all','All'],['week','Week'],['month','Month'],['ytd','YTD'],['custom','Custom']].map(([k,l]) => (<button key={k} onClick={() => applyPreset(k)} className={'px-3 py-1.5 text-xs font-bold rounded-lg ' + (datePreset === k ? 'bg-ak-900 text-white' : 'bg-sand-100 text-ink-400')}>{l}</button>))}
        {(datePreset === 'custom' || dateFrom) && (<><input type="date" value={dateFrom} onChange={e => {setDateFrom(e.target.value);setDatePreset('custom')}} className="border border-sand-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-sand-50" /><span className="text-xs text-ink-400">to</span><input type="date" value={dateTo} onChange={e => {setDateTo(e.target.value);setDatePreset('custom')}} className="border border-sand-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-sand-50" /></>)}
      </div>)}

      {loading ? (<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>) : view === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">{STAGES.map(stage => (<div key={stage} className="kanban-col">
          <div className="flex items-center gap-2 mb-3"><h3 className="text-[0.65rem] font-bold tracking-[0.12em] text-ink-400 uppercase">{stage}</h3><span className="text-[0.6rem] font-bold text-ink-300 bg-sand-200 px-1.5 py-0.5 rounded-full">{kanbanItems[stage]?.length || 0}</span></div>
          <div className="space-y-2">
            {(kanbanItems[stage]||[]).length === 0 && <div className="text-xs text-ink-300 text-center py-6 border border-dashed border-sand-300 rounded-xl">Empty</div>}
            {(kanbanItems[stage]||[]).map(item => { const due = dueBadge(getDueDate(item)); return (
              <div key={item.id} className={'border-l-4 ' + (sc[stage] || 'border-l-gray-400 bg-gray-50') + ' rounded-xl p-3 shadow-sm'}>
                <div className={canE ? 'cursor-pointer' : ''} onClick={() => canE && startEditCard(item)}>
                  <div className="flex items-start justify-between"><div className="text-sm font-bold text-ink-800 leading-tight">{item.product_label || '—'}</div>{due && <span className={'text-[0.5rem] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ' + due.c}>{due.t}</span>}</div>
                  {item.isBatch ? (<><div className="flex items-center gap-2 mt-1.5 flex-wrap"><span className="text-[0.65rem] font-bold text-white bg-ak-900 px-2 py-0.5 rounded">BATCH</span><span className="text-[0.6rem] text-ink-400">{item.total_units} units</span>{item.fabric_yards?.total && <span className="text-[0.6rem] text-ink-400">{item.fabric_yards.total} yds</span>}</div>{item.shopify_order_name && <div className="text-[0.6rem] text-blue-600 mt-1">#{item.shopify_order_name}</div>}{item.master && <div className="text-[0.6rem] text-ink-300 mt-0.5">{item.master}</div>}</>) : (<><div className="flex items-center gap-2 mt-1.5 flex-wrap"><span className="text-[0.65rem] font-bold text-ink-400 bg-white px-1.5 py-0.5 rounded">{item.size}</span>{item.master && <span className="text-[0.6rem] text-ink-300">{item.master}</span>}{item.qc_status === 'fail' && <span className="text-[0.55rem] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">FAIL</span>}{item.qc_status === 'rework' && <span className="text-[0.55rem] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">REWORK</span>}</div><div className="text-[0.6rem] text-ink-300 mt-1 font-mono">{item.full_sku}</div>{item.dispatch_destination && <div className="text-[0.55rem] text-emerald-700 font-semibold mt-1">📦 {item.dispatch_destination}</div>}</>)}
                </div>
                {editingId === item.id && canE && (<div className="mt-2 pt-2 border-t border-sand-200 space-y-2" onClick={e => e.stopPropagation()}>
                  {!item.isBatch && (<div><div className="text-[0.55rem] font-bold text-ink-400 uppercase mb-1">Size</div><div className="flex gap-1">{SIZES.map(s => (<button key={s} onClick={() => setEditSize(s)} className={'flex-1 py-1 text-[0.65rem] font-bold rounded-md border ' + (editSize === s ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{s}</button>))}</div></div>)}
                  <div><div className="text-[0.55rem] font-bold text-ink-400 uppercase mb-1">Master</div><select value={editMaster} onChange={e => setEditMaster(e.target.value)} className="w-full border border-sand-300 rounded-md px-2 py-1 text-[0.7rem] font-semibold bg-sand-50"><option value="">None</option>{masterList.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}</select></div>
                  <div className="flex gap-1"><button onClick={() => setEditingId(null)} className="flex-1 text-[0.6rem] font-bold text-ink-400 bg-sand-100 rounded-md py-1.5">Cancel</button><button onClick={() => saveCardEdit(item)} className="flex-1 text-[0.6rem] font-bold text-white bg-ak-900 rounded-md py-1.5">Save</button></div>
                </div>)}
                {canE && editingId !== item.id && (<div className="flex gap-1 mt-2">
                  {STAGES.indexOf(stage) > 0 && <button onClick={() => item.isBatch ? moveOrder(item, -1) : moveCard(item, -1)} className="flex-1 text-[0.65rem] font-bold text-ink-500 bg-sand-100 border border-sand-200 rounded-lg py-1.5 hover:bg-sand-200">← Back</button>}
                  {stage !== 'Dispatched' && <button onClick={() => item.isBatch ? moveOrder(item, 1) : moveCard(item, 1)} className="flex-1 text-[0.65rem] font-bold text-ak-900 bg-white border border-ak-900/20 rounded-lg py-1.5 hover:bg-ak-100">{item.isBatch && item.current_stage === SPLIT_AFTER ? 'Split →' : item.current_stage === 'QC' ? 'QC →' : 'Move →'}</button>}
                  <button onClick={() => setConfirmDel(item)} className="text-[0.65rem] font-bold text-red-400 hover:text-red-600 px-1.5">✕</button>
                </div>)}
              </div>
            )})}
          </div>
        </div>))}</div>
      ) : view === 'list' ? (
        <div className="bg-white rounded-2xl border border-sand-200 p-5">{allItems.length === 0 ? <p className="text-sm text-ink-300 py-8 text-center">No items</p> : (
          <table className="ak-table"><thead><tr><th>Product</th><th>Type</th><th>Size</th><th>Stage</th><th>Master</th><th>Due</th><th>QC</th><th>Dispatch</th><th>Date</th>{canE && <th className="text-right">Actions</th>}</tr></thead>
          <tbody>{allItems.map(item => { const due = dueBadge(getDueDate(item)); return (<tr key={item.id}>
            <td className="font-semibold">{item.product_label || '—'}</td>
            <td><span className={'stage-badge ' + (item.isBatch ? 'bg-ak-100 text-ak-900' : 'bg-sand-200 text-ink-600')}>{item.isBatch ? 'Batch' : 'Unit'}</span></td>
            <td>{item.isBatch ? (item.total_units + ' pcs') : item.size}</td>
            <td><span className={'stage-badge ' + (item.current_stage === 'Dispatched' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>{item.current_stage}</span></td>
            <td className="text-ink-400 text-sm">{item.master || '—'}</td>
            <td>{due ? <span className={'text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ' + due.c}>{due.t}</span> : '—'}</td>
            <td>{item.qc_status ? <span className={'text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ' + (item.qc_status==='pass'?'bg-emerald-100 text-emerald-800':item.qc_status==='fail'?'bg-red-100 text-red-800':'bg-amber-100 text-amber-800')}>{item.qc_status}</span> : '—'}</td>
            <td className="text-xs">{item.dispatch_destination || '—'}</td>
            <td className="text-xs text-ink-400">{item.order_date || item.created_at?.slice(0,10)}</td>
            {canE && (<td className="text-right"><div className="flex gap-1 justify-end"><button onClick={() => item.isBatch ? moveOrder(item,-1) : moveCard(item,-1)} className="text-[0.6rem] font-bold bg-sand-100 text-ink-500 px-2 py-1 rounded-lg">←</button><button onClick={() => item.isBatch ? moveOrder(item,1) : moveCard(item,1)} className="text-[0.6rem] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg">→</button><button onClick={() => setConfirmDel(item)} className="text-[0.6rem] font-bold bg-red-100 text-red-700 px-2 py-1 rounded-lg">✕</button></div></td>)}
          </tr>)})}</tbody></table>
        )}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-sand-200 p-6 max-w-lg">
          <h2 className="text-lg font-extrabold text-ink-900 mb-4">New production order</h2>
          <form onSubmit={createOrder} className="space-y-4">
            <div className="relative"><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Product</label>
              <input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setShowDropdown(true); setSelProduct(null) }} onFocus={() => setShowDropdown(true)} placeholder="Type name, SKU, or collection…" className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              {showDropdown && filteredProducts.length > 0 && !selProduct && (<div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-sand-300 rounded-xl shadow-lg">{filteredProducts.slice(0,20).map(p => (<button key={p.id} type="button" onClick={() => selectProduct(p)} className="w-full text-left px-3 py-2 hover:bg-sand-50 text-sm border-b border-sand-100 last:border-0"><span className="font-semibold text-ink-800">{p.name}</span><span className="text-ink-400"> — {p.type}</span><span className="text-[0.6rem] text-ink-300 ml-2">{p.base_sku}</span><span className="text-[0.55rem] text-ak-900 ml-2">{p.collection}</span></button>))}</div>)}
              {selProduct && <div className="text-xs text-emerald-700 font-semibold mt-1">✓ {selProduct.label}{selProduct.fabrics?.length > 0 && <span className="text-ink-400"> ({selProduct.fabrics.join(', ')})</span>}</div>}
            </div>
            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Purpose</label><select value={purpose} onChange={e => setPurpose(e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20">{PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}</select>
            </div>
            {(purpose === 'Online Order' || purpose === 'Mixed') && (<div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Order #</label><input type="text" value={orderRef} onChange={e => setOrderRef(e.target.value)} placeholder="e.g. #1045" className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>)}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Fabric yards</label><input type="number" step="0.25" value={fabricYards} onChange={e => setFabricYards(e.target.value)} placeholder="Total yards" className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />{selProduct?.fabrics?.length > 0 && fabricYards && <div className="text-[0.6rem] text-ink-400 mt-1">Deducts {fabricYards}y of {selProduct.fabrics[0]}</div>}</div>
              <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Due date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>
            </div>
            <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Quantities by size</label>
              <div className="grid grid-cols-4 gap-3 mt-2">{SIZES.map(s => (<div key={s}><div className="text-[0.65rem] font-bold text-ink-500 text-center mb-1">{s}</div><input type="number" min="0" value={qty[s]} onChange={e => setQty(q => ({ ...q, [s]: e.target.value }))} className="w-full text-center border border-sand-300 rounded-lg py-2 text-sm font-bold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>))}</div>
              <div className="text-right text-xs font-bold text-ink-400 mt-2">Total: {Object.values(qty).reduce((a, b) => a + Number(b), 0)}</div>
            </div>
            <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Additional notes…" className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20 resize-none" /></div>
            <button type="submit" disabled={saving} className="w-full bg-ak-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-ak-800 disabled:opacity-50">{saving ? 'Creating…' : 'Create Order'}</button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
