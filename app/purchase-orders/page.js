'use client'
import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr, today, can } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/components/AuthProvider'

const DEPARTMENTS = ['Admin', 'Finance', 'Marketing', 'Production', 'Tax', 'Miscellaneous']
// These match your DB constraint exactly
const PO_TYPES = ['Fabric Purchase', 'General Expense']
const PO_STATUSES = ['Pending', 'Approved', 'Received', 'Rejected', 'Paid']

export default function PurchaseOrdersPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [tab, setTab] = useState('list')
  const [pos, setPos] = useState([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  const [poType, setPoType] = useState('Fabric Purchase')
  const [dept, setDept] = useState('Production')
  const [supplier, setSupplier] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [fabricType, setFabricType] = useState('')
  const [fabricYards, setFabricYards] = useState('')
  const [fabricRate, setFabricRate] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [linkedSku, setLinkedSku] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const canCreatePO = can(user, 'canCreate', 'purchase_orders') || can(user, 'canEdit', 'purchase_orders')

  const load = useCallback(async () => {
    setLoading(true)
    const [poRes, pRes] = await Promise.all([
      supabase.from('purchase_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('base_sku, label').eq('is_active', true).order('label'),
    ])
    setPos(poRes.data || [])
    setProducts(pRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function createPO(e) {
    e.preventDefault()
    if (!description.trim()) return toast('Description is required', 'error')
    setSaving(true)
    try {
      const totalAmount = poType === 'Fabric Purchase' ? Number(fabricYards) * Number(fabricRate) : Number(amount)
      const ref = 'PO-' + Date.now().toString(36).toUpperCase()

      const descParts = [description]
      if (reason) descParts.push('Reason: ' + reason)
      if (linkedSku) descParts.push('SKU: ' + linkedSku)
      if (quantity) descParts.push('Qty: ' + quantity)

      const { error } = await supabase.from('purchase_orders').insert({
        ref, po_type: poType, department: dept,
        supplier: supplier || null,
        description: descParts.join(' | '),
        amount: totalAmount || 0,
        invoice_no: invoiceNo || null,
        fabric_type: poType === 'Fabric Purchase' ? fabricType : null,
        fabric_yards: poType === 'Fabric Purchase' ? Number(fabricYards) || null : null,
        fabric_rate: poType === 'Fabric Purchase' ? Number(fabricRate) || null : null,
        status: 'Pending',
        notes: notes || null,
        submitted_by: user?.id, submitted_by_name: user?.name,
      })
      if (error) throw error
      toast('PO created!', 'success')
      setTab('list'); resetForm(); load()
    } catch (err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  async function updateStatus(po, newStatus) {
    const { error } = await supabase.from('purchase_orders').update({ status: newStatus }).eq('id', po.id)
    if (error) return toast(error.message, 'error')

    if (newStatus === 'Received' && po.po_type === 'Fabric Purchase' && po.fabric_type) {
      await supabase.from('fabric_stock').insert({
        fabric: po.fabric_type, yards: po.fabric_yards, rate: po.fabric_rate,
        supplier: po.supplier, po_ref: po.ref, date_received: today(),
      }).catch(() => {})
    }
    toast(newStatus, 'success'); load()
  }

  function resetForm() {
    setPoType('Fabric Purchase'); setDept('Production'); setSupplier(''); setDescription('')
    setAmount(''); setInvoiceNo(''); setFabricType(''); setFabricYards(''); setFabricRate('')
    setQuantity(''); setReason(''); setLinkedSku(''); setNotes('')
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Purchase Orders</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">{pos.length} total · {pos.filter(p => p.status === 'Pending').length} pending</p>
        </div>
        <div className="flex gap-1 bg-sand-100 p-1 rounded-xl">
          {[['list', 'All POs'], ...(canCreatePO ? [['new', '+ New PO']] : [])].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={'px-4 py-2 text-xs font-bold rounded-lg transition-all ' + (tab === k ? 'bg-white shadow text-ink-900' : 'text-ink-400 hover:text-ink-600')}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'list' ? (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {pos.length === 0 ? <p className="text-sm text-ink-300 py-12 text-center">No POs yet</p> : (
            <table className="ak-table">
              <thead><tr><th>Ref</th><th>Type</th><th>Supplier</th><th>Dept</th><th>Description</th><th className="text-right">Amount</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {pos.map(po => (
                  <tr key={po.id}>
                    <td className="font-mono text-xs">{po.ref}</td>
                    <td><span className={'stage-badge ' + (po.po_type === 'Fabric Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-sand-200 text-ink-600')}>{po.po_type === 'Fabric Purchase' ? 'Fabric' : 'Expense'}</span></td>
                    <td className="font-semibold">{po.supplier || '—'}</td>
                    <td className="text-ink-400 text-xs">{po.department}</td>
                    <td className="text-sm max-w-[240px]"><div className="truncate">{po.description}</div></td>
                    <td className="text-right font-bold">{pkr(po.amount)}</td>
                    <td><span className={'stage-badge ' + (po.status === 'Received' || po.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : po.status === 'Approved' ? 'bg-blue-100 text-blue-800' : po.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')}>{po.status}</span></td>
                    <td className="text-right">
                      {can(user, 'canEdit', 'purchase_orders') && (
                        <div className="flex gap-1 justify-end">
                          {po.status === 'Pending' && <button onClick={() => updateStatus(po, 'Approved')} className="text-[0.65rem] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-200">Approve</button>}
                          {(po.status === 'Approved' || po.status === 'Pending') && <button onClick={() => updateStatus(po, 'Received')} className="text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-200">Received</button>}
                          {po.status !== 'Rejected' && po.status !== 'Paid' && <button onClick={() => updateStatus(po, 'Rejected')} className="text-[0.65rem] font-bold bg-red-100 text-red-800 px-2 py-1 rounded-lg hover:bg-red-200">Reject</button>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-sand-200 p-6 max-w-xl">
          <h2 className="text-lg font-extrabold text-ink-900 mb-4">New Purchase Order</h2>
          <div className="flex gap-2 mb-5">
            {PO_TYPES.map(t => (
              <button key={t} onClick={() => setPoType(t)} className={'flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition-all ' + (poType === t ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{t}</button>
            ))}
          </div>
          <form onSubmit={createPO} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <F label="Supplier" value={supplier} set={setSupplier} ph="Supplier name" />
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Department</label>
                <select value={dept} onChange={e => setDept(e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <F label="Description *" value={description} set={setDescription} ph="What is being purchased?" />
            <div className="grid grid-cols-2 gap-3">
              <F label="Reason / Purpose" value={reason} set={setReason} ph="Why is this needed?" />
              <div>
                <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Linked SKU</label>
                <select value={linkedSku} onChange={e => setLinkedSku(e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20">
                  <option value="">None</option>
                  {products.map(p => <option key={p.base_sku} value={p.base_sku}>{p.label}</option>)}
                </select>
              </div>
            </div>
            {poType === 'Fabric Purchase' ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <F label="Fabric Type" value={fabricType} set={setFabricType} ph="Cotton Net" />
                  <F label="Yards" value={fabricYards} set={setFabricYards} type="number" ph="0" />
                  <F label="Rate/Yard" value={fabricRate} set={setFabricRate} type="number" ph="0" />
                </div>
                {fabricYards && fabricRate && <div className="text-right text-sm font-bold text-ak-900">Total: {pkr(Number(fabricYards) * Number(fabricRate))}</div>}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <F label="Quantity" value={quantity} set={setQuantity} type="number" ph="0" />
                <F label="Amount (PKR)" value={amount} set={setAmount} type="number" ph="0" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <F label="Invoice #" value={invoiceNo} set={setInvoiceNo} ph="Optional" />
              <F label="Notes" value={notes} set={setNotes} ph="Optional" />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-ak-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-ak-800 disabled:opacity-50">{saving ? 'Creating…' : 'Create PO'}</button>
          </form>
        </div>
      )}
    </AppShell>
  )
}

function F({ label, value, set, type = 'text', ph }) {
  return (
    <div>
      <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph}
        className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
    </div>
  )
}
