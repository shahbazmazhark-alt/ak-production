'use client'
import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr, today, can } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/components/AuthProvider'

export default function LoansPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [workers, setWorkers] = useState([])
  const [loans, setLoans] = useState([])
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('balances')

  const [workerName, setWorkerName] = useState('')
  const [loanType, setLoanType] = useState('loan')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const canEdit = can(user, 'canEdit', 'loans')

  const load = useCallback(async () => {
    setLoading(true)
    const [wRes, lRes, bRes] = await Promise.all([
      supabase.from('workers').select('name').eq('is_active', true).order('name'),
      supabase.from('loans').select('*').order('date', { ascending: false }).limit(200),
      supabase.from('loan_balances').select('*').order('worker_name'),
    ])
    setWorkers(wRes.data || [])
    setLoans(lRes.data || [])
    setBalances(bRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function addEntry(e) {
    e.preventDefault()
    if (!workerName || !amount) return toast('Fill all fields', 'error')
    setSaving(true)
    try {
      const { error } = await supabase.from('loans').insert({
        worker_name: workerName, type: loanType,
        amount: Number(amount), note: note || null, date: today(),
      })
      if (error) throw error
      const labels = { loan: 'Loan issued', repayment: 'Repayment recorded', advance: 'Advance recorded' }
      toast(labels[loanType] || 'Saved', 'success')
      setWorkerName(''); setAmount(''); setNote(''); setLoanType('loan')
      setTab('balances'); load()
    } catch (err) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  // Separate advances from loans
  const advanceEntries = loans.filter(l => l.type === 'advance')
  const loanEntries = loans.filter(l => l.type !== 'advance')

  const totalOutstanding = balances.reduce((s, b) => s + Number(b.balance || 0), 0)
  const totalAdvances = advanceEntries.reduce((s, a) => s + Number(a.amount || 0), 0)

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Loans & Advances</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">
            Loans: <span className="text-ak-900 font-bold">{pkr(totalOutstanding)}</span>
            {totalAdvances > 0 && <> · Advances: <span className="text-amber-700 font-bold">{pkr(totalAdvances)}</span></>}
          </p>
        </div>
        <div className="flex gap-1 bg-sand-100 p-1 rounded-xl">
          {[['balances', 'Balances'], ['ledger', 'Ledger'], ['advances', 'Advances'], ...(canEdit ? [['new', '+ New']] : [])].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={'px-4 py-2 text-xs font-bold rounded-lg transition-all ' + (tab === k ? 'bg-white shadow text-ink-900' : 'text-ink-400 hover:text-ink-600')}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : tab === 'balances' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.filter(b => Number(b.balance) !== 0).length === 0 ? (
            <p className="col-span-full text-sm text-ink-300 py-12 text-center">No outstanding loans</p>
          ) : balances.filter(b => Number(b.balance) !== 0).map(b => (
            <div key={b.worker_name} className="bg-white rounded-2xl border border-sand-200 p-5">
              <div className="font-bold text-ink-900 text-lg">{b.worker_name}</div>
              <div className="text-2xl font-extrabold text-ak-900 mt-2">{pkr(b.balance)}</div>
              <div className="text-[0.6rem] text-ink-400 font-semibold mt-1">outstanding</div>
              {canEdit && (
                <button onClick={() => { setWorkerName(b.worker_name); setLoanType('repayment'); setTab('new') }}
                  className="mt-3 w-full text-[0.65rem] font-bold text-emerald-800 bg-emerald-100 rounded-lg py-2 hover:bg-emerald-200">
                  Record Repayment
                </button>
              )}
            </div>
          ))}
        </div>
      ) : tab === 'ledger' ? (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {loanEntries.length === 0 ? <p className="text-sm text-ink-300 py-12 text-center">No entries</p> : (
            <table className="ak-table">
              <thead><tr><th>Worker</th><th>Type</th><th className="text-right">Amount</th><th>Note</th><th>Date</th></tr></thead>
              <tbody>
                {loanEntries.map(l => (
                  <tr key={l.id}>
                    <td className="font-semibold">{l.worker_name}</td>
                    <td><span className={'stage-badge ' + (l.type === 'repayment' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>{l.type}</span></td>
                    <td className={'text-right font-bold ' + (l.type === 'repayment' ? 'text-emerald-700' : 'text-ak-900')}>{l.type === 'repayment' ? '-' : ''}{pkr(l.amount)}</td>
                    <td className="text-sm text-ink-400 max-w-[180px] truncate">{l.note || '—'}</td>
                    <td className="text-xs text-ink-400">{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : tab === 'advances' ? (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {advanceEntries.length === 0 ? <p className="text-sm text-ink-300 py-12 text-center">No advances</p> : (
            <table className="ak-table">
              <thead><tr><th>Worker</th><th className="text-right">Amount</th><th>Note</th><th>Date</th></tr></thead>
              <tbody>
                {advanceEntries.map(l => (
                  <tr key={l.id}>
                    <td className="font-semibold">{l.worker_name}</td>
                    <td className="text-right font-bold text-amber-700">{pkr(l.amount)}</td>
                    <td className="text-sm text-ink-400 max-w-[180px] truncate">{l.note || '—'}</td>
                    <td className="text-xs text-ink-400">{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-sand-200 p-6 max-w-lg">
          <h2 className="text-lg font-extrabold text-ink-900 mb-4">New Entry</h2>
          <div className="flex gap-2 mb-5">
            {[['loan', 'Loan'], ['repayment', 'Repayment'], ['advance', 'Advance']].map(([k, l]) => (
              <button key={k} onClick={() => setLoanType(k)} className={'flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition-all ' + (loanType === k ? 'border-ak-900 bg-ak-100 text-ak-900' : 'border-sand-200 text-ink-400')}>{l}</button>
            ))}
          </div>
          <form onSubmit={addEntry} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Worker</label>
              <select value={workerName} onChange={e => setWorkerName(e.target.value)} className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20">
                <option value="">Select…</option>
                {workers.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Amount (PKR)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
            </div>
            <div>
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Note</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional" className="mt-1 w-full border border-sand-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-ak-900 text-white font-bold text-sm py-3 rounded-xl hover:bg-ak-800 disabled:opacity-50">
              {saving ? 'Saving…' : loanType === 'loan' ? 'Issue Loan' : loanType === 'repayment' ? 'Record Repayment' : 'Record Advance'}
            </button>
          </form>
        </div>
      )}
    </AppShell>
  )
}
