'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr } from '@/lib/supabase'

function parseCsv(text) {
  const lines = text.split('\n'), headers = [], rows = []
  let inQuote = false, field = '', row = []
  const pushField = () => { row.push(field.trim()); field = '' }
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') { inQuote = !inQuote; continue }
    if (c === ',' && !inQuote) { pushField(); continue }
    if ((c === '\n' || c === '\r') && !inQuote) {
      if (c === '\r' && text[i+1] === '\n') i++
      pushField()
      if (row.length > 0 && row.some(f => f)) {
        if (headers.length === 0) headers.push(...row)
        else { const obj = {}; headers.forEach((h, j) => { obj[h] = row[j] || '' }); rows.push(obj) }
      }
      row = []; continue
    }
    field += c
  }
  if (row.length > 0 || field) { pushField(); if (headers.length > 0) { const obj = {}; headers.forEach((h, j) => { obj[h] = row[j] || '' }); rows.push(obj) } }
  return rows
}

export default function ReportsPage() {
  const [tab, setTab] = useState('inventory')
  const [products, setProducts] = useState([])
  const [costs, setCosts] = useState({})
  const [pos, setPos] = useState([])
  const [unitCards, setUnitCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSupplier, setExpandedSupplier] = useState(null)

  // Shopify data (uploaded CSVs)
  const [salesData, setSalesData] = useState(null) // parsed sales CSV
  const [inventoryData, setInventoryData] = useState(null) // parsed inventory CSV
  const salesRef = useRef(null)
  const invRef = useRef(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [pRes, cRes, poRes, ucRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).order('name'),
        supabase.from('product_costs').select('*'),
        supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }),
        supabase.from('unit_cards').select('product_id, current_stage, dispatch_destination, size, full_sku'),
      ])
      setProducts(pRes.data || [])
      const costMap = {}; (cRes.data || []).forEach(c => { costMap[c.id] = c }); setCosts(costMap)
      setPos(poRes.data || [])
      setUnitCards(ucRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  function handleSalesUpload(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { setSalesData(parseCsv(ev.target.result)) }
    reader.readAsText(file)
  }

  function handleInventoryUpload(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result
      if (file.name.endsWith('.csv')) { setInventoryData(parseCsv(text)); return }
      // For xlsx we'll handle it differently — prompt for CSV export
      setInventoryData(null)
    }
    reader.readAsText(file)
  }

  // ─── INVENTORY & SALES MATCHING ───
  const inventorySales = useMemo(() => {
    const result = {}

    // Initialize from AK products
    products.forEach(p => {
      result[p.base_sku] = {
        baseSku: p.base_sku, name: p.name, type: p.type, collection: p.collection,
        retail: p.retail_price || 0, bomCost: costs[p.id]?.bom_cost || 0,
        produced: 0, inProduction: 0, dispatchedStore: 0, dispatchedOnline: 0, dispatchedOther: 0,
        shopifySales: 0, shopifyInv: 0, sizes: {},
      }
    })

    // Count from unit cards
    unitCards.forEach(c => {
      const product = products.find(p => p.id === c.product_id)
      if (!product) return
      const sku = product.base_sku
      if (!result[sku]) return
      const r = result[sku]
      r.produced++
      if (c.current_stage === 'Dispatched') {
        const dest = c.dispatch_destination || ''
        if (dest.startsWith('Store')) r.dispatchedStore++
        else if (dest.startsWith('Online')) r.dispatchedOnline++
        else if (dest) r.dispatchedOther++
        else r.dispatchedStore++ // default to store if no destination set
      } else {
        r.inProduction++
      }
      const sz = c.size || 'OS'
      if (!r.sizes[sz]) r.sizes[sz] = { produced: 0, dispatched: 0, sold: 0, inv: 0 }
      r.sizes[sz].produced++
      if (c.current_stage === 'Dispatched') r.sizes[sz].dispatched++
    })

    // Merge Shopify sales
    if (salesData) {
      salesData.forEach(row => {
        const fullSku = row['Product variant SKU'] || ''
        const baseSku = fullSku.split('/')[0]
        const sales = parseFloat(row['Total sales'] || 0)
        if (!baseSku || isNaN(sales)) return
        if (result[baseSku]) {
          result[baseSku].shopifySales += sales
        }
      })
    }

    // Merge Shopify inventory
    if (inventoryData) {
      inventoryData.forEach(row => {
        const fullSku = row['SKU'] || ''
        const baseSku = fullSku.split('/')[0]
        const qty = parseInt(row['Available Quantity'] || 0)
        if (!baseSku || isNaN(qty)) return
        if (result[baseSku]) {
          result[baseSku].shopifyInv += qty
        }
      })
    }

    return Object.values(result).sort((a, b) => b.shopifySales - a.shopifySales)
  }, [products, costs, unitCards, salesData, inventoryData])

  const invTotals = useMemo(() => ({
    produced: inventorySales.reduce((s, d) => s + d.produced, 0),
    inProd: inventorySales.reduce((s, d) => s + d.inProduction, 0),
    store: inventorySales.reduce((s, d) => s + d.dispatchedStore, 0),
    online: inventorySales.reduce((s, d) => s + d.dispatchedOnline, 0),
    sales: inventorySales.reduce((s, d) => s + d.shopifySales, 0),
    inv: inventorySales.reduce((s, d) => s + d.shopifyInv, 0),
  }), [inventorySales])

  // ─── SKU PROFITABILITY ───
  const skuData = useMemo(() => {
    return products.map(p => {
      const bomCost = costs[p.id]?.bom_cost || 0
      const retail = p.retail_price || 0
      const margin = retail > 0 ? retail - bomCost : 0
      const marginPct = retail > 0 ? Math.round((margin / retail) * 100) : 0
      const cards = unitCards.filter(c => c.product_id === p.id)
      const dispatched = cards.filter(c => c.current_stage === 'Dispatched').length
      const inProduction = cards.filter(c => c.current_stage !== 'Dispatched').length
      return {
        id: p.id, name: p.name, type: p.type, collection: p.collection, baseSku: p.base_sku,
        bomCost, retail, margin, marginPct,
        dispatched, inProduction, totalUnits: cards.length,
        totalRevenue: dispatched * retail, totalCost: cards.length * bomCost, totalMargin: dispatched * margin,
        isBleeder: retail > 0 && marginPct < 20, noRetail: retail === 0,
      }
    }).sort((a, b) => { if (a.noRetail !== b.noRetail) return a.noRetail ? 1 : -1; return a.marginPct - b.marginPct })
  }, [products, costs, unitCards])

  const skuTotals = useMemo(() => ({
    revenue: skuData.reduce((s, d) => s + d.totalRevenue, 0),
    cost: skuData.reduce((s, d) => s + d.totalCost, 0),
    margin: skuData.reduce((s, d) => s + d.totalMargin, 0),
    bleeders: skuData.filter(d => d.isBleeder).length,
    noRetail: skuData.filter(d => d.noRetail).length,
  }), [skuData])

  // ─── COLLECTION P&L ───
  const collectionData = useMemo(() => {
    const cols = {}
    skuData.forEach(s => {
      const col = s.collection || 'Uncategorized'
      if (!cols[col]) cols[col] = { name: col, skus: 0, units: 0, dispatched: 0, revenue: 0, cost: 0, margin: 0 }
      const c = cols[col]; c.skus++; c.units += s.totalUnits; c.dispatched += s.dispatched
      c.revenue += s.totalRevenue; c.cost += s.totalCost; c.margin += s.totalMargin
    })
    return Object.values(cols).map(c => ({ ...c, marginPct: c.revenue > 0 ? Math.round((c.margin / c.revenue) * 100) : 0 })).sort((a, b) => b.revenue - a.revenue)
  }, [skuData])

  // ─── SUPPLIER LEDGER ───
  const supplierData = useMemo(() => {
    const suppliers = {}
    pos.forEach(po => {
      const name = po.supplier || 'Unknown'
      if (!suppliers[name]) suppliers[name] = { name, totalOrdered: 0, totalPaid: 0, outstanding: 0, poCount: 0, fabricPOs: 0, expensePOs: 0, pos: [] }
      const s = suppliers[name]; s.poCount++; s.totalOrdered += Number(po.amount) || 0
      if (po.po_type === 'Fabric Purchase') s.fabricPOs++; else s.expensePOs++
      if (po.status === 'Paid') s.totalPaid += Number(po.amount) || 0
      s.pos.push(po)
    })
    Object.values(suppliers).forEach(s => { s.outstanding = s.totalOrdered - s.totalPaid })
    return Object.values(suppliers).sort((a, b) => b.outstanding - a.outstanding)
  }, [pos])

  const supplierTotals = useMemo(() => ({
    ordered: supplierData.reduce((s, d) => s + d.totalOrdered, 0),
    paid: supplierData.reduce((s, d) => s + d.totalPaid, 0),
    outstanding: supplierData.reduce((s, d) => s + d.outstanding, 0),
  }), [supplierData])

  const TABS = [
    { key: 'inventory', label: 'Inventory & Sales' },
    { key: 'sku', label: 'SKU Profitability' },
    { key: 'collection', label: 'Collection P&L' },
    { key: 'supplier', label: 'Supplier Ledger' },
  ]

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold text-ink-900">Reports</h1>
      </div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={'px-4 py-2 text-xs font-bold rounded-xl transition-all ' + (tab === t.key ? 'bg-ak-900 text-white' : 'bg-sand-100 text-ink-400 hover:text-ink-600')}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div> : (<>

        {/* ═══ INVENTORY & SALES ═══ */}
        {tab === 'inventory' && (<div>
          {/* Upload bar */}
          <div className="bg-white rounded-2xl border border-sand-200 p-5 mb-6">
            <div className="text-[0.65rem] font-bold text-ink-400 uppercase tracking-wider mb-3">Shopify data import</div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs font-semibold text-ink-600 mb-1">Sales CSV <span className="text-ink-300">(Analytics → Reports → Sales by product)</span></div>
                <input ref={salesRef} type="file" accept=".csv" onChange={handleSalesUpload} className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-ak-100 file:text-ak-900 hover:file:bg-ak-100/80 cursor-pointer" />
                {salesData && <div className="text-[0.6rem] text-emerald-600 font-semibold mt-1">{salesData.length} rows loaded</div>}
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs font-semibold text-ink-600 mb-1">Inventory CSV <span className="text-ink-300">(Products → Export inventory)</span></div>
                <input ref={invRef} type="file" accept=".csv" onChange={handleInventoryUpload} className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-800 hover:file:bg-blue-100/80 cursor-pointer" />
                {inventoryData && <div className="text-[0.6rem] text-emerald-600 font-semibold mt-1">{inventoryData.length} rows loaded</div>}
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-sand-100 rounded-2xl p-4"><div className="text-[0.6rem] font-bold tracking-wider text-ink-400 uppercase mb-1">Produced</div><div className="text-lg font-extrabold text-ink-900">{invTotals.produced}</div></div>
            <div className="bg-amber-50 rounded-2xl p-4"><div className="text-[0.6rem] font-bold tracking-wider text-amber-600 uppercase mb-1">In production</div><div className="text-lg font-extrabold text-amber-800">{invTotals.inProd}</div></div>
            <div className="bg-blue-50 rounded-2xl p-4"><div className="text-[0.6rem] font-bold tracking-wider text-blue-600 uppercase mb-1">→ Store</div><div className="text-lg font-extrabold text-blue-800">{invTotals.store}</div></div>
            <div className="bg-purple-50 rounded-2xl p-4"><div className="text-[0.6rem] font-bold tracking-wider text-purple-600 uppercase mb-1">→ Online</div><div className="text-lg font-extrabold text-purple-800">{invTotals.online}</div></div>
            <div className="bg-emerald-50 rounded-2xl p-4"><div className="text-[0.6rem] font-bold tracking-wider text-emerald-600 uppercase mb-1">Shopify sales</div><div className="text-lg font-extrabold text-emerald-800">{pkr(invTotals.sales)}</div></div>
            <div className="bg-teal-50 rounded-2xl p-4"><div className="text-[0.6rem] font-bold tracking-wider text-teal-600 uppercase mb-1">Store stock</div><div className="text-lg font-extrabold text-teal-800">{invTotals.inv} pcs</div></div>
          </div>

          {/* Pipeline table */}
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            <table className="ak-table">
              <thead><tr>
                <th>Product</th><th>Collection</th>
                <th className="text-center">Produced</th><th className="text-center">WIP</th>
                <th className="text-center">→ Store</th><th className="text-center">→ Online</th>
                {inventoryData && <th className="text-center">In Store</th>}
                {salesData && <th className="text-right">Shopify sales</th>}
                <th className="text-right">Retail</th>
              </tr></thead>
              <tbody>{inventorySales.filter(d => d.produced > 0 || d.shopifySales > 0 || d.shopifyInv > 0).map(d => (
                <tr key={d.baseSku}>
                  <td><div className="font-bold text-ink-800">{d.name}</div><div className="text-[0.6rem] text-ink-400">{d.type}{d.baseSku && <span className="font-mono"> · {d.baseSku}</span>}</div></td>
                  <td><span className="text-[0.6rem] font-bold text-ak-900 bg-ak-100 px-2 py-0.5 rounded-full">{d.collection || '—'}</span></td>
                  <td className="text-center font-bold">{d.produced || '—'}</td>
                  <td className="text-center">{d.inProduction > 0 ? <span className="text-amber-700 font-semibold">{d.inProduction}</span> : '—'}</td>
                  <td className="text-center">{d.dispatchedStore > 0 ? <span className="text-blue-700 font-semibold">{d.dispatchedStore}</span> : '—'}</td>
                  <td className="text-center">{d.dispatchedOnline > 0 ? <span className="text-purple-700 font-semibold">{d.dispatchedOnline}</span> : '—'}</td>
                  {inventoryData && <td className="text-center">{d.shopifyInv > 0 ? <span className="text-teal-700 font-bold">{d.shopifyInv}</span> : d.shopifyInv < 0 ? <span className="text-red-600 font-bold">{d.shopifyInv}</span> : '—'}</td>}
                  {salesData && <td className="text-right font-semibold">{d.shopifySales > 0 ? pkr(d.shopifySales) : '—'}</td>}
                  <td className="text-right text-sm font-semibold">{d.retail > 0 ? pkr(d.retail) : <span className="text-amber-500">—</span>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {!salesData && !inventoryData && (
            <div className="mt-4 bg-sand-50 rounded-2xl p-6 text-center">
              <div className="text-sm font-semibold text-ink-400 mb-2">Upload your Shopify exports to see the full pipeline</div>
              <div className="text-xs text-ink-300">Production data from the AK system is already loaded. Add Shopify sales and inventory CSVs above to see sell-through and store stock.</div>
            </div>
          )}
        </div>)}

        {/* ═══ SKU PROFITABILITY ═══ */}
        {tab === 'sku' && (<div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-sand-100 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-ink-400 uppercase mb-1">Dispatched revenue</div><div className="text-xl font-extrabold text-ink-900">{pkr(skuTotals.revenue)}</div></div>
            <div className="bg-sand-100 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-ink-400 uppercase mb-1">Production cost</div><div className="text-xl font-extrabold text-ink-900">{pkr(skuTotals.cost)}</div></div>
            <div className="bg-red-50 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-red-600 uppercase mb-1">Bleeding SKUs (&lt;20%)</div><div className="text-xl font-extrabold text-red-800">{skuTotals.bleeders}</div></div>
            <div className="bg-amber-50 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-amber-600 uppercase mb-1">No retail price</div><div className="text-xl font-extrabold text-amber-800">{skuTotals.noRetail}</div></div>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            <table className="ak-table">
              <thead><tr><th>Product</th><th>Collection</th><th className="text-right">BOM cost</th><th className="text-right">Retail</th><th className="text-right">Margin</th><th className="text-center">Units</th><th className="text-right">Revenue</th></tr></thead>
              <tbody>{skuData.map(d => (
                <tr key={d.id} className={d.isBleeder ? 'bg-red-50/50' : d.noRetail ? 'bg-amber-50/30' : ''}>
                  <td><div className="font-bold text-ink-800">{d.name}</div><div className="text-[0.6rem] text-ink-400">{d.type}{d.baseSku && <span className="font-mono"> · {d.baseSku}</span>}</div></td>
                  <td><span className="text-[0.6rem] font-bold text-ak-900 bg-ak-100 px-2 py-0.5 rounded-full">{d.collection || '—'}</span></td>
                  <td className="text-right font-semibold">{pkr(d.bomCost)}</td>
                  <td className="text-right font-semibold">{d.noRetail ? <span className="text-amber-600">Not set</span> : pkr(d.retail)}</td>
                  <td className="text-right">{d.noRetail ? '—' : (<><span className={'font-extrabold ' + (d.marginPct < 15 ? 'text-red-700' : d.marginPct < 20 ? 'text-amber-700' : d.marginPct < 30 ? 'text-ink-700' : 'text-emerald-700')}>{d.marginPct}%</span>{d.isBleeder && <div className="text-[0.55rem] font-bold text-red-600">BLEEDING</div>}</>)}</td>
                  <td className="text-center"><span className="text-sm font-bold text-emerald-700">{d.dispatched}</span>{d.inProduction > 0 && <span className="text-[0.6rem] text-ink-400 ml-1">+{d.inProduction}</span>}</td>
                  <td className="text-right font-semibold">{d.dispatched > 0 ? pkr(d.totalRevenue) : '—'}</td>
                </tr>
              ))}</tbody>
              <tfoot><tr className="border-t-2 border-sand-300 bg-sand-50">
                <td colSpan={2} className="font-extrabold text-ink-700 text-right">Totals</td>
                <td className="text-right font-bold">{pkr(skuTotals.cost)}</td>
                <td className="text-right font-bold">{pkr(skuTotals.revenue)}</td>
                <td className="text-right font-extrabold text-emerald-700">{skuTotals.revenue > 0 ? Math.round((skuTotals.margin / skuTotals.revenue) * 100) + '%' : '—'}</td>
                <td></td>
                <td className="text-right font-extrabold text-ak-900 text-lg">{pkr(skuTotals.margin)}</td>
              </tr></tfoot>
            </table>
          </div>
        </div>)}

        {/* ═══ COLLECTION P&L ═══ */}
        {tab === 'collection' && (<div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {collectionData.map(c => (
              <div key={c.name} className="bg-white rounded-2xl border border-sand-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div><h3 className="font-extrabold text-ink-900">{c.name}</h3><span className="text-[0.6rem] text-ink-400 font-semibold">{c.skus} SKUs · {c.units} units</span></div>
                  <span className={'text-lg font-extrabold ' + (c.marginPct < 15 ? 'text-red-700' : c.marginPct < 20 ? 'text-amber-700' : 'text-emerald-700')}>{c.revenue > 0 ? c.marginPct + '%' : '—'}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-ink-400">Revenue</span><span className="font-bold text-ink-800">{pkr(c.revenue)}</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">Cost</span><span className="font-bold text-ink-800">{pkr(c.cost)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-sand-200"><span className="font-bold text-ink-600">Gross margin</span><span className={'font-extrabold ' + (c.margin >= 0 ? 'text-emerald-700' : 'text-red-700')}>{pkr(c.margin)}</span></div>
                </div>
                {c.revenue > 0 && (<div className="mt-3 h-2 bg-sand-100 rounded-full overflow-hidden"><div className={'h-full rounded-full ' + (c.marginPct < 15 ? 'bg-red-400' : c.marginPct < 20 ? 'bg-amber-400' : 'bg-emerald-400')} style={{ width: Math.min(100, Math.max(5, c.marginPct)) + '%' }} /></div>)}
                <div className="flex justify-between mt-2 text-[0.6rem] text-ink-400"><span>{c.dispatched} dispatched</span><span>{c.units - c.dispatched} in production</span></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            <table className="ak-table">
              <thead><tr><th>Collection</th><th className="text-center">SKUs</th><th className="text-center">Dispatched</th><th className="text-right">Revenue</th><th className="text-right">Cost</th><th className="text-right">Margin</th><th className="text-right">%</th></tr></thead>
              <tbody>{collectionData.map(c => (
                <tr key={c.name}>
                  <td className="font-bold text-ink-800">{c.name}</td>
                  <td className="text-center">{c.skus}</td>
                  <td className="text-center font-bold text-emerald-700">{c.dispatched}</td>
                  <td className="text-right font-semibold">{pkr(c.revenue)}</td>
                  <td className="text-right font-semibold">{pkr(c.cost)}</td>
                  <td className="text-right font-bold">{pkr(c.margin)}</td>
                  <td className="text-right"><span className={'font-extrabold ' + (c.marginPct < 15 ? 'text-red-700' : c.marginPct < 20 ? 'text-amber-700' : 'text-emerald-700')}>{c.revenue > 0 ? c.marginPct + '%' : '—'}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>)}

        {/* ═══ SUPPLIER LEDGER ═══ */}
        {tab === 'supplier' && (<div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-sand-100 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-ink-400 uppercase mb-1">Total ordered</div><div className="text-xl font-extrabold text-ink-900">{pkr(supplierTotals.ordered)}</div></div>
            <div className="bg-emerald-50 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-emerald-600 uppercase mb-1">Total paid</div><div className="text-xl font-extrabold text-emerald-800">{pkr(supplierTotals.paid)}</div></div>
            <div className="bg-red-50 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-red-600 uppercase mb-1">Outstanding</div><div className="text-xl font-extrabold text-red-800">{pkr(supplierTotals.outstanding)}</div></div>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
            <table className="ak-table">
              <thead><tr><th>Supplier</th><th className="text-center">POs</th><th className="text-center">Type</th><th className="text-right">Ordered</th><th className="text-right">Paid</th><th className="text-right">Outstanding</th></tr></thead>
              <tbody>{supplierData.map(s => (<>
                <tr key={s.name} className="cursor-pointer" onClick={() => setExpandedSupplier(expandedSupplier === s.name ? null : s.name)}>
                  <td className="font-bold text-ink-800">{s.name}</td>
                  <td className="text-center">{s.poCount}</td>
                  <td className="text-center">{s.fabricPOs > 0 && <span className="text-[0.6rem] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded-full mr-1">Fabric ×{s.fabricPOs}</span>}{s.expensePOs > 0 && <span className="text-[0.6rem] font-bold text-ink-600 bg-sand-200 px-1.5 py-0.5 rounded-full">Expense ×{s.expensePOs}</span>}</td>
                  <td className="text-right font-semibold">{pkr(s.totalOrdered)}</td>
                  <td className="text-right font-semibold text-emerald-700">{pkr(s.totalPaid)}</td>
                  <td className="text-right"><span className={'font-extrabold ' + (s.outstanding > 0 ? 'text-red-700' : 'text-emerald-700')}>{s.outstanding > 0 ? pkr(s.outstanding) : 'Settled'}</span></td>
                </tr>
                {expandedSupplier === s.name && (
                  <tr key={s.name + '-d'}>
                    <td colSpan={6} className="bg-sand-50/50 px-6 py-3">
                      <div className="text-[0.65rem] font-bold text-ink-500 uppercase tracking-wider mb-2">PO history — {s.name}</div>
                      <div className="space-y-1">{s.pos.map(po => (
                        <div key={po.id} className="flex items-center justify-between text-xs py-1.5 border-b border-sand-100 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-ink-400">{po.ref}</span>
                            <span className="text-ink-500">{po.created_at?.slice(0, 10)}</span>
                            <span className={'text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full ' + (po.po_type === 'Fabric Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-sand-200 text-ink-600')}>{po.po_type === 'Fabric Purchase' ? 'Fabric' : 'Expense'}</span>
                            <span className="text-ink-400 truncate max-w-[200px]">{po.description}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">{pkr(po.amount)}</span>
                            <span className={'text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full ' + (po.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : po.status === 'Received' ? 'bg-blue-100 text-blue-800' : po.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')}>{po.status}</span>
                          </div>
                        </div>
                      ))}</div>
                    </td>
                  </tr>
                )}
              </>))}</tbody>
              <tfoot><tr className="border-t-2 border-sand-300 bg-sand-50">
                <td colSpan={3} className="font-extrabold text-ink-700 text-right">Totals ({supplierData.length} suppliers)</td>
                <td className="text-right font-bold">{pkr(supplierTotals.ordered)}</td>
                <td className="text-right font-bold text-emerald-700">{pkr(supplierTotals.paid)}</td>
                <td className="text-right font-extrabold text-red-700 text-lg">{pkr(supplierTotals.outstanding)}</td>
              </tr></tfoot>
            </table>
          </div>
        </div>)}

      </>)}
    </AppShell>
  )
}
