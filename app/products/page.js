'use client'
import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr, STAGES, can } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/components/AuthProvider'

const DEFAULT_FABRICS = ['Cotton Net', 'Organza', 'Viscose', 'Raw Silk', 'Swiss Lawn', 'Tissue']
const TYPES = ['Shirt', 'Culottes', 'Dupatta', 'Shalwar', 'Pant', 'Tulip Shalwar', 'Shirt & Matching Culottes']
const BOM_ITEMS = ['fabric', 'thread', 'applique', 'slip_fabric', 'lace', 'buttons', 'dyeing', 'embroidery', 'comp_emb', 'design_punch', 'adda_material', 'adda_work', 'stitching']

export default function ProductsPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [costs, setCosts] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCol, setFilterCol] = useState('')
  const [filterType, setFilterType] = useState('')
  const [editing, setEditing] = useState(null)
  const [isNew, setIsNew] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [bom, setBom] = useState([])
  const [bomLoading, setBomLoading] = useState(false)
  const [bomEdits, setBomEdits] = useState([]) // local editable BOM rows
  const [customFabric, setCustomFabric] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const canEditProducts = can(user, 'canEdit', 'products')
  const canDelete = can(user, 'canDelete', 'products')

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    setLoading(true)
    const [pRes, cRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('product_costs').select('id, bom_cost, margin, margin_pct'),
    ])
    setProducts(pRes.data || [])
    const costMap = {}
    ;(cRes.data || []).forEach(c => { costMap[c.id] = c })
    setCosts(costMap)
    setLoading(false)
  }

  const collections = [...new Set(products.map(p => p.collection).filter(Boolean))].sort()
  const types = [...new Set(products.map(p => p.type).filter(Boolean))].sort()
  const allFabrics = [...new Set([...DEFAULT_FABRICS, ...products.flatMap(p => p.fabrics || [])])].sort()

  const filtered = products.filter(p => {
    if (!p.is_active) return false
    if (search && !(p.name?.toLowerCase().includes(search.toLowerCase()) || p.label?.toLowerCase().includes(search.toLowerCase()) || p.base_sku?.toLowerCase().includes(search.toLowerCase()))) return false
    if (filterCol && p.collection !== filterCol) return false
    if (filterType && p.type !== filterType) return false
    return true
  })

  function startEdit(product) {
    setEditing({ ...product, fabrics: product.fabrics || [], production_path: product.production_path || [] })
    setIsNew(false)
    loadBom(product.id)
  }

  function startNew() {
    setEditing({ name: '', type: 'Shirt', base_sku: '', collection: '', label: '', stitch_rate: 0, retail_price: 0, fabrics: [], production_path: [], is_active: true })
    setIsNew(true)
    setBom([]); setBomEdits([])
  }

  async function loadBom(productId) {
    setBomLoading(true)
    const { data } = await supabase.from('product_bom').select('*').eq('product_id', productId).order('sort_order')
    const rows = (data || []).map(r => ({ ...r, _dirty: false }))
    setBom(rows)
    setBomEdits(rows.map(r => ({ id: r.id, line_key: r.line_key, line_label: r.line_label || r.line_key?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), qty: r.qty, rate: r.rate, sort_order: r.sort_order, _isNew: false, _deleted: false })))
    setBomLoading(false)
  }

  function updateField(f, v) { setEditing(e => ({ ...e, [f]: v })) }
  function toggleFabric(fab) { setEditing(e => ({ ...e, fabrics: e.fabrics.includes(fab) ? e.fabrics.filter(f => f !== fab) : [...e.fabrics, fab] })) }
  function addCustomFabric() { if (customFabric.trim() && !editing.fabrics.includes(customFabric.trim())) { setEditing(e => ({ ...e, fabrics: [...e.fabrics, customFabric.trim()] })) } setCustomFabric('') }
  function toggleStage(stage) { setEditing(e => ({ ...e, production_path: e.production_path.includes(stage) ? e.production_path.filter(s => s !== stage) : [...e.production_path, stage] })) }

  // BOM editing functions
  function updateBomRow(idx, field, value) {
    setBomEdits(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }
  function addBomRow() {
    const nextSort = bomEdits.length > 0 ? Math.max(...bomEdits.map(r => r.sort_order || 0)) + 1 : 1
    setBomEdits(prev => [...prev, { id: null, line_key: '', line_label: '', qty: 1, rate: 0, sort_order: nextSort, _isNew: true, _deleted: false }])
  }
  function removeBomRow(idx) {
    setBomEdits(prev => prev.map((r, i) => i === idx ? { ...r, _deleted: true } : r))
  }
  function addPresetBomRow(key) {
    const exists = bomEdits.find(r => r.line_key === key && !r._deleted)
    if (exists) return toast('Already exists', 'error')
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const nextSort = bomEdits.length > 0 ? Math.max(...bomEdits.map(r => r.sort_order || 0)) + 1 : 1
    setBomEdits(prev => [...prev, { id: null, line_key: key, line_label: label, qty: 1, rate: 0, sort_order: nextSort, _isNew: true, _deleted: false }])
  }

  const bomTotal = bomEdits.filter(r => !r._deleted).reduce((s, r) => s + (Number(r.qty) || 0) * (Number(r.rate) || 0), 0)

  async function saveProduct(e) {
    e.preventDefault()
    if (!editing.name) return toast('Name is required', 'error')
    setSavingEdit(true)
    try {
      const label = editing.label || (editing.name + ' - ' + editing.type)
      const payload = {
        name: editing.name, type: editing.type, base_sku: editing.base_sku,
        collection: editing.collection, label,
        stitch_rate: Number(editing.stitch_rate) || 0,
        retail_price: Number(editing.retail_price) || 0,
        fabrics: editing.fabrics, production_path: editing.production_path,
        is_active: editing.is_active, updated_at: new Date().toISOString(),
      }

      let productId = editing.id
      if (isNew) {
        const { data, error } = await supabase.from('products').insert(payload).select().single()
        if (error) throw error
        productId = data.id
        toast('Product added', 'success')
      } else {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
        if (error) throw error
        toast('Product updated', 'success')
      }

      // Save BOM edits
      if (productId) {
        // Delete removed rows
        const toDelete = bomEdits.filter(r => r._deleted && r.id)
        for (const r of toDelete) {
          await supabase.from('product_bom').delete().eq('id', r.id)
        }
        // Update existing rows
        const toUpdate = bomEdits.filter(r => !r._deleted && !r._isNew && r.id)
        for (const r of toUpdate) {
          await supabase.from('product_bom').update({
            line_key: r.line_key, line_label: r.line_label,
            qty: Number(r.qty) || 0, rate: Number(r.rate) || 0,
            sort_order: r.sort_order,
          }).eq('id', r.id)
        }
        // Insert new rows
        const toInsert = bomEdits.filter(r => !r._deleted && r._isNew && r.line_key)
        for (const r of toInsert) {
          await supabase.from('product_bom').insert({
            product_id: productId, line_key: r.line_key, line_label: r.line_label,
            qty: Number(r.qty) || 0, rate: Number(r.rate) || 0,
            sort_order: r.sort_order,
          })
        }
      }

      setEditing(null); loadProducts()
    } catch (err) { toast(err.message, 'error') }
    finally { setSavingEdit(false) }
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
    if (error) return toast(error.message, 'error')
    toast('Product removed', 'success')
    setEditing(null); setConfirmDelete(null); loadProducts()
  }

  // ── EDIT VIEW ──
  if (editing) {
    const missingBomItems = BOM_ITEMS.filter(k => !bomEdits.find(r => r.line_key === k && !r._deleted))
    return (
      <AppShell>
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-extrabold text-ink-900">{isNew ? 'Add Product' : editing.name}</h1>
            <button onClick={() => setEditing(null)} className="text-sm font-bold text-ink-400 hover:text-ink-600">← Back</button>
          </div>
          <form onSubmit={saveProduct} className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Name</label>
                <input type="text" value={editing.name} onChange={e => updateField('name', e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>
              <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Type</label>
                <select value={editing.type} onChange={e => updateField('type', e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Base SKU</label>
                <input type="text" value={editing.base_sku} onChange={e => updateField('base_sku', e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>
              <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Collection</label>
                <input type="text" value={editing.collection} onChange={e => updateField('collection', e.target.value)} list="col-list" className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
                <datalist id="col-list">{collections.map(c => <option key={c} value={c} />)}</datalist></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Stitch Rate</label>
                <input type="number" value={editing.stitch_rate} onChange={e => updateField('stitch_rate', e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>
              <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Retail Price</label>
                <input type="number" value={editing.retail_price} onChange={e => updateField('retail_price', e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>
              <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Label</label>
                <input type="text" value={editing.label} onChange={e => updateField('label', e.target.value)} placeholder={editing.name + ' - ' + editing.type} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">Fabrics</label>
              <div className="flex flex-wrap gap-2">
                {allFabrics.map(f => (
                  <button key={f} type="button" onClick={() => toggleFabric(f)} className={'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ' + (editing.fabrics.includes(f) ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{f}</button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="text" value={customFabric} onChange={e => setCustomFabric(e.target.value)} placeholder="Add other fabric…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomFabric())} className="flex-1 border border-sand-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
                <button type="button" onClick={addCustomFabric} className="text-xs font-bold text-ak-900 bg-ak-100 px-3 rounded-lg">+ Add</button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">Production Path</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => (
                  <button key={s} type="button" onClick={() => toggleStage(s)} className={'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ' + (editing.production_path.includes(s) ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{s}</button>
                ))}
              </div>
              {editing.production_path.length > 0 && <div className="mt-2 text-xs text-ink-400">{editing.production_path.join(' → ')}</div>}
            </div>

            {/* ── EDITABLE BOM ── */}
            <div className="pt-3 border-t border-sand-200">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[0.65rem] font-bold text-ink-400 uppercase tracking-wider">Bill of Materials</div>
                <div className="text-sm font-extrabold text-ak-900">{pkr(bomTotal)}</div>
              </div>

              {bomLoading ? <div className="text-xs text-ink-300">Loading…</div> : (
                <>
                  {bomEdits.filter(r => !r._deleted).length > 0 && (
                    <div className="space-y-2 mb-3">
                      {bomEdits.map((row, idx) => row._deleted ? null : (
                        <div key={idx} className="flex gap-2 items-center">
                          <input type="text" value={row.line_label} onChange={e => updateBomRow(idx, 'line_label', e.target.value)} placeholder="Item name"
                            className="flex-[2] border border-sand-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-sand-50 focus:outline-none focus:ring-1 focus:ring-ak-900/20" />
                          <input type="number" value={row.qty} onChange={e => updateBomRow(idx, 'qty', e.target.value)} placeholder="Qty" step="0.01"
                            className="w-16 border border-sand-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-sand-50 text-center focus:outline-none focus:ring-1 focus:ring-ak-900/20" />
                          <input type="number" value={row.rate} onChange={e => updateBomRow(idx, 'rate', e.target.value)} placeholder="Rate"
                            className="w-20 border border-sand-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-sand-50 text-right focus:outline-none focus:ring-1 focus:ring-ak-900/20" />
                          <div className="w-20 text-right text-xs font-bold text-ink-700">{pkr((Number(row.qty) || 0) * (Number(row.rate) || 0))}</div>
                          <button type="button" onClick={() => removeBomRow(idx)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick-add preset items */}
                  {missingBomItems.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[0.55rem] font-bold text-ink-300 uppercase mb-1">Quick add:</div>
                      <div className="flex flex-wrap gap-1">
                        {missingBomItems.map(k => (
                          <button key={k} type="button" onClick={() => addPresetBomRow(k)}
                            className="text-[0.6rem] font-semibold text-ink-400 bg-sand-100 px-2 py-1 rounded-md hover:bg-sand-200 transition-colors">
                            + {k.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="button" onClick={addBomRow} className="text-xs font-bold text-ak-900 bg-ak-100 px-3 py-1.5 rounded-lg hover:bg-ak-100/80">+ Custom BOM Line</button>
                </>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.is_active} onChange={e => updateField('is_active', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm font-semibold text-ink-700">Active</span>
              </label>
              {!isNew && canDelete && (
                confirmDelete === editing.id ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => deleteProduct(editing.id)} className="text-xs font-bold text-white bg-red-600 px-3 py-1.5 rounded-lg">Confirm Delete</button>
                    <button type="button" onClick={() => setConfirmDelete(null)} className="text-xs font-bold text-ink-400 bg-sand-100 px-3 py-1.5 rounded-lg">Cancel</button>
                  </div>
                ) : <button type="button" onClick={() => setConfirmDelete(editing.id)} className="text-xs font-bold text-red-600 hover:text-red-800">Delete Product</button>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 py-3 text-sm font-bold text-ink-500 bg-sand-100 rounded-xl hover:bg-sand-200">Cancel</button>
              {canEditProducts && (
                <button type="submit" disabled={savingEdit} className="flex-1 py-3 text-sm font-bold text-white bg-ak-900 rounded-xl hover:bg-ak-800 disabled:opacity-50">
                  {savingEdit ? 'Saving…' : isNew ? 'Add Product' : 'Save Changes'}
                </button>
              )}
            </div>
          </form>
        </div>
      </AppShell>
    )
  }

  // ── LIST VIEW ──
  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Products</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">{filtered.length} active</p>
        </div>
        {canEditProducts && <button onClick={startNew} className="px-4 py-2.5 text-xs font-bold text-white bg-ak-900 rounded-xl hover:bg-ak-800">+ Add Product</button>}
      </div>
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="border border-sand-300 rounded-xl px-3 py-2 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20 w-64" />
        <select value={filterCol} onChange={e => setFilterCol(e.target.value)} className="border border-sand-300 rounded-xl px-3 py-2 text-sm font-semibold bg-sand-50"><option value="">All Collections</option>{collections.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-sand-300 rounded-xl px-3 py-2 text-sm font-semibold bg-sand-50"><option value="">All Types</option>{types.map(t => <option key={t} value={t}>{t}</option>)}</select>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const cost = costs[p.id]; const gc = cost?.bom_cost || 0
            return (
              <div key={p.id} onClick={() => startEdit(p)} className="bg-white rounded-2xl border border-sand-200 p-4 card-hover cursor-pointer">
                <div className="flex justify-between items-start">
                  <div><h3 className="font-bold text-ink-900">{p.name}</h3><span className="text-xs font-semibold text-ink-400">{p.type}</span></div>
                  <span className="text-[0.6rem] font-bold text-ak-900 bg-ak-100 px-2 py-0.5 rounded-full">{p.collection}</span>
                </div>
                <div className="text-xs font-mono text-ink-300 mt-2">{p.base_sku}</div>
                <div className="flex gap-4 mt-3 text-xs">
                  {gc > 0 && <div><span className="text-ink-400">Gross: </span><span className="font-bold text-ak-900">{pkr(gc)}</span></div>}
                  <div><span className="text-ink-400">Stitch: </span><span className="font-bold text-ink-700">{pkr(p.stitch_rate)}</span></div>
                  {p.retail_price > 0 && <div><span className="text-ink-400">Retail: </span><span className="font-bold text-ink-700">{pkr(p.retail_price)}</span></div>}
                </div>
                {gc > 0 && p.retail_price > 0 && <div className="mt-1 text-xs"><span className="text-ink-400">Margin: </span><span className="font-bold text-emerald-700">{Math.round((p.retail_price - gc) / p.retail_price * 100)}%</span></div>}
                {p.fabrics?.length > 0 && <div className="flex gap-1 mt-2 flex-wrap">{p.fabrics.map(f => <span key={f} className="text-[0.6rem] font-bold bg-sand-100 text-ink-500 px-2 py-0.5 rounded-full">{f}</span>)}</div>}
                {p.production_path?.length > 0 && <div className="mt-2 text-[0.55rem] font-semibold text-ink-300">{p.production_path.join(' → ')}</div>}
              </div>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
