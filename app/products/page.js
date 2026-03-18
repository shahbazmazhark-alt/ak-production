'use client'
import { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr, STAGES, can } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/components/AuthProvider'

const DEFAULT_FABRICS = ['Cotton Net', 'Organza', 'Viscose', 'Raw Silk', 'Swiss Lawn', 'Tissue']
const TYPES = ['Shirt', 'Culottes', 'Dupatta', 'Shalwar', 'Pant', 'Tulip Shalwar', 'Shirt & Matching Culottes']

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
    setBom([])
  }

  async function loadBom(productId) {
    setBomLoading(true)
    const { data } = await supabase.from('product_bom').select('*').eq('product_id', productId).order('sort_order')
    setBom(data || [])
    setBomLoading(false)
  }

  function updateField(f, v) { setEditing(e => ({ ...e, [f]: v })) }
  function toggleFabric(fab) { setEditing(e => ({ ...e, fabrics: e.fabrics.includes(fab) ? e.fabrics.filter(f => f !== fab) : [...e.fabrics, fab] })) }
  function addCustomFabric() {
    if (!customFabric.trim()) return
    if (!editing.fabrics.includes(customFabric.trim())) {
      setEditing(e => ({ ...e, fabrics: [...e.fabrics, customFabric.trim()] }))
    }
    setCustomFabric('')
  }
  function toggleStage(stage) { setEditing(e => ({ ...e, production_path: e.production_path.includes(stage) ? e.production_path.filter(s => s !== stage) : [...e.production_path, stage] })) }

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
      if (isNew) {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        toast('Product added', 'success')
      } else {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
        if (error) throw error
        toast('Product updated', 'success')
      }
      setEditing(null); loadProducts()
    } catch (err) { toast(err.message, 'error') }
    finally { setSavingEdit(false) }
  }

  async function deleteProduct(id) {
    const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
    if (error) return toast(error.message, 'error')
    toast('Product deactivated', 'success')
    setEditing(null); setConfirmDelete(null); loadProducts()
  }

  // ── EDIT VIEW ──
  if (editing) {
    return (
      <AppShell>
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-extrabold text-ink-900">{isNew ? 'Add Product' : editing.name}</h1>
            <button onClick={() => setEditing(null)} className="text-sm font-bold text-ink-400 hover:text-ink-600">← Back</button>
          </div>
          <form onSubmit={saveProduct} className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Name</label>
                <input type="text" value={editing.name} onChange={e => updateField('name', e.target.value)}
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Type</label>
                <select value={editing.type} onChange={e => updateField('type', e.target.value)}
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Base SKU</label>
                <input type="text" value={editing.base_sku} onChange={e => updateField('base_sku', e.target.value)}
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Collection</label>
                <input type="text" value={editing.collection} onChange={e => updateField('collection', e.target.value)} list="col-list"
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
                <datalist id="col-list">{collections.map(c => <option key={c} value={c} />)}</datalist>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Stitch Rate</label>
                <input type="number" value={editing.stitch_rate} onChange={e => updateField('stitch_rate', e.target.value)}
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Retail Price</label>
                <input type="number" value={editing.retail_price} onChange={e => updateField('retail_price', e.target.value)}
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Label</label>
                <input type="text" value={editing.label} onChange={e => updateField('label', e.target.value)}
                  placeholder={editing.name + ' - ' + editing.type}
                  className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">Fabrics</label>
              <div className="flex flex-wrap gap-2">
                {allFabrics.map(f => (
                  <button key={f} type="button" onClick={() => toggleFabric(f)}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ' + (editing.fabrics.includes(f) ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{f}</button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input type="text" value={customFabric} onChange={e => setCustomFabric(e.target.value)}
                  placeholder="Add other fabric…" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomFabric())}
                  className="flex-1 border border-sand-300 rounded-lg px-3 py-1.5 text-xs font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
                <button type="button" onClick={addCustomFabric} className="text-xs font-bold text-ak-900 bg-ak-100 px-3 rounded-lg">+ Add</button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">Production Path</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => (
                  <button key={s} type="button" onClick={() => toggleStage(s)}
                    className={'px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ' + (editing.production_path.includes(s) ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{s}</button>
                ))}
              </div>
              {editing.production_path.length > 0 && <div className="mt-2 text-xs text-ink-400">{editing.production_path.join(' → ')}</div>}
            </div>

            {/* BOM display */}
            {!isNew && (
              <div className="pt-3 border-t border-sand-200">
                <div className="text-[0.65rem] font-bold text-ink-400 uppercase tracking-wider mb-2">Bill of Materials</div>
                {bomLoading ? <div className="text-xs text-ink-300">Loading…</div> : bom.length === 0 ? <div className="text-xs text-ink-300">No BOM</div> : (
                  <table className="w-full text-xs">
                    <thead><tr className="text-ink-400 text-left"><th className="py-1">Item</th><th className="py-1 text-right">Qty</th><th className="py-1 text-right">Rate</th><th className="py-1 text-right">Total</th></tr></thead>
                    <tbody>
                      {bom.map(l => (
                        <tr key={l.id}><td className="py-1 font-semibold text-ink-700">{l.line_label || l.line_key}</td><td className="py-1 text-right text-ink-500">{l.qty}</td><td className="py-1 text-right text-ink-500">{pkr(l.rate)}</td><td className="py-1 text-right font-bold">{pkr(l.total)}</td></tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="border-t border-sand-200"><td colSpan={3} className="py-2 font-bold text-ink-600">Gross Cost</td><td className="py-2 text-right font-extrabold text-ak-900">{pkr(bom.reduce((s, l) => s + Number(l.total || 0), 0))}</td></tr></tfoot>
                  </table>
                )}
              </div>
            )}

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
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(editing.id)} className="text-xs font-bold text-red-600 hover:text-red-800">Delete Product</button>
                )
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
          <p className="text-sm text-ink-400 font-semibold mt-0.5">{products.filter(p => p.is_active).length} active</p>
        </div>
        {canEditProducts && (
          <button onClick={startNew} className="px-4 py-2.5 text-xs font-bold text-white bg-ak-900 rounded-xl hover:bg-ak-800">+ Add Product</button>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
          className="border border-sand-300 rounded-xl px-3 py-2 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20 w-64" />
        <select value={filterCol} onChange={e => setFilterCol(e.target.value)} className="border border-sand-300 rounded-xl px-3 py-2 text-sm font-semibold bg-sand-50">
          <option value="">All Collections</option>
          {collections.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-sand-300 rounded-xl px-3 py-2 text-sm font-semibold bg-sand-50">
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const cost = costs[p.id]
            const gc = cost?.bom_cost || 0
            return (
              <div key={p.id} onClick={() => startEdit(p)}
                className={'bg-white rounded-2xl border border-sand-200 p-4 card-hover cursor-pointer ' + (!p.is_active ? 'opacity-50' : '')}>
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
                {gc > 0 && p.retail_price > 0 && (
                  <div className="mt-1 text-xs"><span className="text-ink-400">Margin: </span><span className="font-bold text-emerald-700">{Math.round((p.retail_price - gc) / p.retail_price * 100)}%</span></div>
                )}
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
