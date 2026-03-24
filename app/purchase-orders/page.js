'use client'
import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr, today, can } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/components/AuthProvider'

const DEPARTMENTS = ['Admin', 'Finance', 'Marketing', 'Production', 'Tax', 'Miscellaneous']
const PO_TYPES = ['Fabric Purchase', 'General Expense']

export default function PurchaseOrdersPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [tab, setTab] = useState('list')
  const [pos, setPos] = useState([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [viewPO, setViewPO] = useState(null)
  const [editingPO, setEditingPO] = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)

  // Bill link modal — shown when marking as Paid
  const [billModal, setBillModal] = useState(null) // PO object
  const [billLinkInput, setBillLinkInput] = useState('')

  // Form
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
  const [poNotes, setPoNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const canManagePO = can(user, 'canEdit', 'purchase_orders')
  const canCreatePO = can(user, 'canCreate', 'purchase_orders') || canManagePO
  const canDeletePO = can(user, 'canDelete', 'purchase_orders')

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

  function populateForm(po) {
    setPoType(po.po_type || 'General Expense'); setDept(po.department || 'Production')
    setSupplier(po.supplier || ''); setDescription(po.description || '')
    setAmount(po.amount || ''); setInvoiceNo(po.invoice_no || '')
    setFabricType(po.fabric_type || ''); setFabricYards(po.fabric_yards || '')
    setFabricRate(po.fabric_rate || ''); setPoNotes(po.notes?.replace(/Bill:\s*.+/g, '').trim() || '')
    setQuantity(''); setReason(''); setLinkedSku('')
  }

  function resetForm() {
    setPoType('Fabric Purchase'); setDept('Production'); setSupplier(''); setDescription('')
    setAmount(''); setInvoiceNo(''); setFabricType(''); setFabricYards(''); setFabricRate('')
    setQuantity(''); setReason(''); setLinkedSku(''); setPoNotes(''); setEditingPO(null)
  }

  async function savePO(e) {
    e.preventDefault()
    if (!description.trim()) return toast('Description is required', 'error')
    setSaving(true)
    try {
      const totalAmount = poType === 'Fabric Purchase' ? Number(fabricYards) * Number(fabricRate) : Number(amount)
      const descParts = [description]
      if (reason) descParts.push('Reason: ' + reason)
      if (linkedSku) descParts.push('SKU: ' + linkedSku)
      if (quantity) descParts.push('Qty: ' + quantity)

      const payload = {
        po_type: poType, department: dept, supplier: supplier || null,
        description: editingPO ? description : descParts.join(' | '),
        amount: totalAmount || 0, invoice_no: invoiceNo || null,
        fabric_type: poType === 'Fabric Purchase' ? fabricType : null,
        fabric_yards: poType === 'Fabric Purchase' ? Number(fabricYards) || null : null,
        fabric_rate: poType === 'Fabric Purchase' ? Number(fabricRate) || null : null,
        notes: poNotes || null,
      }

      if (editingPO) {
        const { error } = await supabase.from('purchase_orders').update(payload).eq('id', editingPO.id)
        if (error) throw error
        toast('PO updated', 'success')
      } else {
        payload.ref = 'PO-' + Date.now().toString(36).toUpperCase()
        payload.status = 'Pending'; payload.submitted_by = user?.id; payload.submitted_by_name = user?.name
        const { error } = await supabase.from('purchase_orders').insert(payload)
        if (error) throw error
        toast('PO created!', 'success')
      }
      setTab('list'); resetForm(); load()
    } catch (err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  async function updateStatus(po, newStatus) {
    // If marking as Paid, show bill link modal first
    if (newStatus === 'Paid') {
      setBillModal(po); setBillLinkInput(''); return
    }

    const { error } = await supabase.from('purchase_orders').update({ status: newStatus }).eq('id', po.id)
    if (error) return toast(error.message, 'error')

    if (newStatus === 'Received' && po.po_type === 'Fabric Purchase' && po.fabric_type) {
      try {
        const { error: stockErr } = await supabase.from('fabric_stock').insert({
          fabric: po.fabric_type, yards: po.fabric_yards, rate: po.fabric_rate,
          supplier: po.supplier, po_ref: po.ref, date_received: today(),
        })
        if (stockErr) toast('PO received but stock failed: ' + stockErr.message, 'error')
        else toast('Received — fabric stock updated', 'success')
      } catch (e) { toast('PO received but stock error', 'error') }
    } else { toast(newStatus, 'success') }
    if (viewPO) setViewPO({ ...po, status: newStatus })
    load()
  }

  async function confirmMarkPaid() {
    if (!billModal) return
    const notesParts = []
    if (billLinkInput.trim()) notesParts.push('Bill: ' + billLinkInput.trim())
    if (billModal.notes) notesParts.push(billModal.notes.replace(/Bill:\s*.+/g, '').trim())
    const newNotes = notesParts.filter(Boolean).join('\n')

    const { error } = await supabase.from('purchase_orders').update({
      status: 'Paid', notes: newNotes || billModal.notes,
    }).eq('id', billModal.id)
    if (error) return toast(error.message, 'error')
    toast('Marked as Paid', 'success')
    setBillModal(null)
    if (viewPO) setViewPO({ ...billModal, status: 'Paid', notes: newNotes || billModal.notes })
    load()
  }

  async function deletePO(po) {
    const { error } = await supabase.from('purchase_orders').delete().eq('id', po.id)
    if (error) return toast(error.message, 'error')
    toast('PO deleted', 'success'); setConfirmDel(null); setViewPO(null); load()
  }

  function startEdit(po) { populateForm(po); setEditingPO(po); setTab('form') }

  function printPO(po) {
    const w = window.open('', '_blank', 'width=800,height=600')
    const billUrl = po.notes?.match(/Bill:\s*(.+)/)?.[1]?.trim()
    w.document.write(`<!DOCTYPE html><html><head><title>PO ${po.ref}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:40px;color:#1A1512}.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;border-bottom:3px solid #8B0000;padding-bottom:20px}.brand{font-size:11px;font-weight:800;letter-spacing:3px;color:#8B0000;text-transform:uppercase}.brand-sub{font-size:9px;color:#968172;letter-spacing:2px;margin-top:2px}.ref{font-size:24px;font-weight:800;text-align:right}.date{font-size:12px;color:#968172;margin-top:4px;text-align:right}.badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;margin-top:6px;background:#FEFCE8;color:#A16207}table{width:100%;border-collapse:collapse;margin:20px 0}th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#968172;padding:8px 0;border-bottom:2px solid #E3D9CA}td{padding:10px 0;border-bottom:1px solid #F0EBE3;font-size:13px}.lbl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#968172;font-weight:700;margin-bottom:4px}.val{font-size:14px;font-weight:600}.row{display:flex;gap:40px;margin-bottom:16px}.col{flex:1}.total{font-size:20px;font-weight:800;color:#8B0000;text-align:right;margin-top:20px;border-top:2px solid #8B0000;padding-top:12px}.notes{margin-top:20px;padding:12px;background:#F9F6F2;border-radius:8px;font-size:12px;color:#5F4C3D}.footer{margin-top:40px;font-size:10px;color:#B3A393;text-align:center}@media print{body{padding:20px}}</style></head><body>
    <div class="hdr"><div><div class="brand">Ayesha Khurram</div><div class="brand-sub">Purchase Order</div></div><div><div class="ref">${po.ref}</div><div class="date">${po.created_at?.slice(0,10)||''}</div><span class="badge">${po.status}</span></div></div>
    <div class="row"><div class="col"><div class="lbl">Type</div><div class="val">${po.po_type}</div></div><div class="col"><div class="lbl">Department</div><div class="val">${po.department||'—'}</div></div><div class="col"><div class="lbl">Supplier</div><div class="val">${po.supplier||'—'}</div></div></div>
    <div class="row"><div class="col"><div class="lbl">Invoice #</div><div class="val">${po.invoice_no||'—'}</div></div><div class="col"><div class="lbl">Submitted By</div><div class="val">${po.submitted_by_name||'—'}</div></div></div>
    <table><thead><tr><th>Description</th>${po.po_type==='Fabric Purchase'?'<th>Fabric</th><th>Yards</th><th>Rate/Yd</th>':''}<th style="text-align:right">Amount</th></tr></thead>
    <tbody><tr><td>${po.description||'—'}</td>${po.po_type==='Fabric Purchase'?`<td>${po.fabric_type||'—'}</td><td>${po.fabric_yards||'—'}</td><td>PKR ${Number(po.fabric_rate||0).toLocaleString()}</td>`:''}<td style="text-align:right;font-weight:700">PKR ${Number(po.amount||0).toLocaleString()}</td></tr></tbody></table>
    <div class="total">Total: PKR ${Number(po.amount||0).toLocaleString()}</div>
    ${billUrl?`<div class="notes"><div class="lbl">Bill</div>${billUrl}</div>`:''}
    <div class="footer">Ayesha Khurram — AK Production System</div></body></html>`)
    w.document.close(); setTimeout(() => w.print(), 500)
  }

  // ── DETAIL VIEW ──
  if (viewPO) {
    const po = viewPO
    const billUrl = po.notes?.match(/Bill:\s*(.+)/)?.[1]?.trim()
    const cleanNotes = po.notes?.replace(/Bill:\s*.+/g, '').trim()

    return (
      <AppShell>
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-extrabold text-ink-900">{po.ref}</h1>
            <div className="flex gap-2">
              <button onClick={() => printPO(po)} className="text-xs font-bold text-ink-500 bg-sand-100 px-3 py-2 rounded-xl hover:bg-sand-200">🖨 Print</button>
              {canManagePO && <button onClick={() => { startEdit(po); setViewPO(null) }} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100">Edit</button>}
              {canDeletePO && (
                confirmDel?.id === po.id
                  ? <div className="flex gap-1"><button onClick={() => deletePO(po)} className="text-xs font-bold text-white bg-red-600 px-3 py-2 rounded-xl">Confirm</button><button onClick={() => setConfirmDel(null)} className="text-xs font-bold text-ink-400 bg-sand-100 px-3 py-2 rounded-xl">Cancel</button></div>
                  : <button onClick={() => setConfirmDel(po)} className="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl hover:bg-red-100">Delete</button>
              )}
              <button onClick={() => setViewPO(null)} className="text-sm font-bold text-ink-400 hover:text-ink-600">← Back</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className={'stage-badge text-sm ' + (po.po_type === 'Fabric Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-sand-200 text-ink-600')}>{po.po_type}</span>
              <span className={'stage-badge text-sm ' + (po.status === 'Received' || po.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : po.status === 'Approved' ? 'bg-blue-100 text-blue-800' : po.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')}>{po.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><div className="text-[0.6rem] font-bold text-ink-400 uppercase">Supplier</div><div className="font-semibold text-sm">{po.supplier || '—'}</div></div>
              <div><div className="text-[0.6rem] font-bold text-ink-400 uppercase">Department</div><div className="font-semibold text-sm">{po.department}</div></div>
              <div><div className="text-[0.6rem] font-bold text-ink-400 uppercase">Invoice #</div><div className="font-semibold text-sm">{po.invoice_no || '—'}</div></div>
            </div>
            <div><div className="text-[0.6rem] font-bold text-ink-400 uppercase">Description</div><div className="text-sm font-semibold mt-1">{po.description}</div></div>
            {po.po_type === 'Fabric Purchase' && (
              <div className="grid grid-cols-3 gap-4 bg-blue-50 rounded-xl p-4">
                <div><div className="text-[0.6rem] font-bold text-blue-600 uppercase">Fabric</div><div className="font-bold text-blue-800">{po.fabric_type}</div></div>
                <div><div className="text-[0.6rem] font-bold text-blue-600 uppercase">Yards</div><div className="font-bold text-blue-800">{po.fabric_yards}</div></div>
                <div><div className="text-[0.6rem] font-bold text-blue-600 uppercase">Rate/Yard</div><div className="font-bold text-blue-800">{pkr(po.fabric_rate)}</div></div>
              </div>
            )}
            <div className="text-right text-xl font-extrabold text-ak-900 pt-2 border-t border-sand-200">{pkr(po.amount)}</div>
            {billUrl && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <div className="text-[0.6rem] font-bold text-amber-700 uppercase mb-1">📎 Bill attachment</div>
                <a href={billUrl.startsWith('http') ? billUrl : 'https://' + billUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline break-all">{billUrl}</a>
              </div>
            )}
            {cleanNotes && <div className="bg-sand-50 rounded-xl p-4"><div className="text-[0.6rem] font-bold text-ink-400 uppercase mb-1">Notes</div><div className="text-sm text-ink-600 whitespace-pre-wrap">{cleanNotes}</div></div>}
            <div className="text-xs text-ink-300 pt-2">Submitted by {po.submitted_by_name || '—'} on {po.created_at?.slice(0, 10)}</div>
            {canManagePO && (
              <div className="flex gap-2 pt-2">
                {po.status === 'Pending' && <button onClick={() => updateStatus(po, 'Approved')} className="flex-1 text-sm font-bold bg-blue-100 text-blue-800 py-2.5 rounded-xl hover:bg-blue-200">Approve</button>}
                {(po.status === 'Pending' || po.status === 'Approved') && <button onClick={() => updateStatus(po, 'Received')} className="flex-1 text-sm font-bold bg-emerald-100 text-emerald-800 py-2.5 rounded-xl hover:bg-emerald-200">Received</button>}
                {po.status === 'Received' && <button onClick={() => updateStatus(po, 'Paid')} className="flex-1 text-sm font-bold bg-purple-100 text-purple-800 py-2.5 rounded-xl hover:bg-purple-200">Mark Paid</button>}
                {po.status !== 'Rejected' && po.status !== 'Paid' && <button onClick={() => updateStatus(po, 'Rejected')} className="flex-1 text-sm font-bold bg-red-100 text-red-800 py-2.5 rounded-xl hover:bg-red-200">Reject</button>}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    )
  }

  // ── FORM ──
  if (tab === 'form') {
    return (
      <AppShell>
        <div className="max-w-xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-extrabold text-ink-900">{editingPO ? 'Edit PO — ' + editingPO.ref : 'New Purchase Order'}</h1>
            <button onClick={() => { setTab('list'); resetForm() }} className="text-sm font-bold text-ink-400 hover:text-ink-600">← Back</button>
          </div>
          <div className="bg-white rounded-2xl border border-sand-200 p-6">
            <div className="flex gap-2 mb-5">
              {PO_TYPES.map(t => (
                <button key={t} onClick={() => setPoType(t)} className={'flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition-all ' + (poType === t ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{t}</button>
              ))}
            </div>
            <form onSubmit={savePO} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <F label="Supplier" value={supplier} set={setSupplier} ph="Supplier name" />
                <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Department</label>
                  <select value={dept} onChange={e => setDept(e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20">{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <F label="Description *" value={description} set={setDescription} ph="What is being purchased?" />
              {!editingPO && (
                <div className="grid grid-cols-2 gap-3">
                  <F label="Reason / Purpose" value={reason} set={setReason} ph="Why is this needed?" />
                  <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Linked SKU</label>
                    <select value={linkedSku} onChange={e => setLinkedSku(e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20"><option value="">None</option>{products.map(p => <option key={p.base_sku} value={p.base_sku}>{p.label}</option>)}</select></div>
                </div>
              )}
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
                  {!editingPO && <F label="Quantity" value={quantity} set={setQuantity} type="number" ph="0" />}
                  <F label="Amount (PKR)" value={amount} set={setAmount} type="number" ph="0" />
                </div>
              )}
              <F label="Invoice #" value={invoiceNo} set={setInvoiceNo} ph="Optional" />
              <F label="Notes" value={poNotes} set={setPoNotes} ph="Additional notes" />
              <button type="submit" disabled={saving} className="w-full bg-ak-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-ak-800 disabled:opacity-50">{saving ? 'Saving…' : editingPO ? 'Update PO' : 'Create PO'}</button>
            </form>
          </div>
        </div>
      </AppShell>
    )
  }

  // ── LIST VIEW ──
  return (
    <AppShell>
      {/* Bill link modal for Mark as Paid */}
      {billModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]" onClick={() => setBillModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-ink-900 mb-1">Mark as Paid — {billModal.ref}</h3>
            <p className="text-sm text-ink-400 mb-4">{pkr(billModal.amount)} to {billModal.supplier || 'supplier'}</p>
            <div className="mb-4">
              <label className="text-xs font-bold text-amber-700 uppercase tracking-wider">📎 Attach bill (link/URL)</label>
              <input type="text" value={billLinkInput} onChange={e => setBillLinkInput(e.target.value)}
                placeholder="Paste Google Drive, photo, or invoice link"
                className="mt-1 w-full border border-amber-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400/40" />
              <p className="text-[0.6rem] text-ink-400 mt-1">Optional — you can add later by editing the PO</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBillModal(null)} className="flex-1 py-2.5 text-sm font-bold text-ink-500 bg-sand-100 rounded-xl hover:bg-sand-200">Cancel</button>
              <button onClick={confirmMarkPaid} className="flex-1 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700">Confirm Paid</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {confirmDel && !viewPO && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[90]" onClick={() => setConfirmDel(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-ink-900 mb-2">Delete {confirmDel.ref}?</h3>
            <p className="text-sm text-ink-400 mb-4">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2.5 text-sm font-bold text-ink-500 bg-sand-100 rounded-xl">Cancel</button>
              <button onClick={() => deletePO(confirmDel)} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Purchase Orders</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">{pos.length} total · {pos.filter(p => p.status === 'Pending').length} pending</p>
        </div>
        {canCreatePO && <button onClick={() => { resetForm(); setTab('form') }} className="px-4 py-2.5 text-xs font-bold text-white bg-ak-900 rounded-xl hover:bg-ak-800">+ New PO</button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {pos.length === 0 ? <p className="text-sm text-ink-300 py-12 text-center">No POs yet</p> : (
            <table className="ak-table">
              <thead><tr><th>Ref</th><th>Date</th><th>Type</th><th>Supplier</th><th>Description</th><th className="text-right">Amount</th><th>Status</th><th>📎</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {pos.map(po => {
                  const hasBill = po.notes?.includes('Bill:')
                  return (
                    <tr key={po.id} className="cursor-pointer" onClick={() => setViewPO(po)}>
                      <td className="font-mono text-xs">{po.ref}</td>
                      <td className="text-xs text-ink-400">{po.created_at?.slice(0, 10)}</td>
                      <td><span className={'stage-badge ' + (po.po_type === 'Fabric Purchase' ? 'bg-blue-100 text-blue-800' : 'bg-sand-200 text-ink-600')}>{po.po_type === 'Fabric Purchase' ? 'Fabric' : 'Expense'}</span></td>
                      <td className="font-semibold">{po.supplier || '—'}</td>
                      <td className="text-sm max-w-[180px]"><div className="truncate">{po.description}</div></td>
                      <td className="text-right font-bold">{pkr(po.amount)}</td>
                      <td><span className={'stage-badge ' + (po.status === 'Received' || po.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : po.status === 'Approved' ? 'bg-blue-100 text-blue-800' : po.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')}>{po.status}</span></td>
                      <td>{hasBill && <span title="Bill attached">📎</span>}</td>
                      <td className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => printPO(po)} className="text-[0.65rem] font-bold bg-sand-100 text-ink-500 px-2 py-1 rounded-lg hover:bg-sand-200" title="Print">🖨</button>
                          {canManagePO && <button onClick={() => startEdit(po)} className="text-[0.65rem] font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-100">Edit</button>}
                          {canDeletePO && <button onClick={() => setConfirmDel(po)} className="text-[0.65rem] font-bold bg-red-50 text-red-600 px-2 py-1 rounded-lg hover:bg-red-100">✕</button>}
                          {canManagePO && po.status === 'Pending' && <button onClick={() => updateStatus(po, 'Approved')} className="text-[0.65rem] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-200">Approve</button>}
                          {canManagePO && (po.status === 'Approved' || po.status === 'Pending') && <button onClick={() => updateStatus(po, 'Received')} className="text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-200">Received</button>}
                          {canManagePO && po.status === 'Received' && <button onClick={() => updateStatus(po, 'Paid')} className="text-[0.65rem] font-bold bg-purple-100 text-purple-800 px-2 py-1 rounded-lg hover:bg-purple-100">Paid</button>}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AppShell>
  )
}

function F({ label, value, set, type = 'text', ph }) {
  return (
    <div><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph}
        className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" /></div>
  )
}
