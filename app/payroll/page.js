'use client'
import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr, today } from '@/lib/supabase'

// Excluded from payroll entirely (monthly salaried, handled outside)
const EXCLUDE = ['Shahbaz', 'Ayesha', 'Khizar', 'Umer', 'Qadir', 'Safdar', 'Rijah']

// These workers show OT ONLY (base is monthly, handled outside)
const OT_ONLY = ['Ashfaq', 'Sikandar', 'Shafeeq']

export default function PayrollPage() {
  const [workers, setWorkers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); const day = d.getDay()
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    return d.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date(); const day = d.getDay()
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + 5)
    return d.toISOString().slice(0, 10)
  })

  const load = useCallback(async () => {
    setLoading(true)
    const [wRes, aRes] = await Promise.all([
      supabase.from('workers').select('*').eq('is_active', true).order('name'),
      supabase.from('attendance').select('*').gte('date', startDate).lte('date', endDate),
    ])
    setWorkers((wRes.data || []).filter(w => !EXCLUDE.includes(w.name)))
    setAttendance(aRes.data || [])
    setLoading(false)
  }, [startDate, endDate])

  useEffect(() => { load() }, [load])

  const payroll = workers.map(w => {
    const recs = attendance.filter(a => a.worker_id === w.id)
    const present = recs.filter(r => r.time_in)
    const absent = recs.filter(r => !r.time_in)
    const totalOtMins = present.reduce((s, r) => s + (r.ot_mins || 0), 0)
    const totalOtPay = present.reduce((s, r) => s + (r.ot_pay || 0), 0)
    const totalLateMins = present.reduce((s, r) => s + (r.late_mins || 0), 0)
    const totalLateDed = present.reduce((s, r) => s + (r.late_deduction || 0), 0)

    let totalMinsWorked = 0
    present.forEach(r => {
      if (r.time_in && r.time_out) {
        const [ih, im] = r.time_in.slice(0, 5).split(':').map(Number)
        const [oh, om] = r.time_out.slice(0, 5).split(':').map(Number)
        totalMinsWorked += (oh * 60 + om) - (ih * 60 + im)
      } else if (r.time_in) totalMinsWorked += 9 * 60
    })
    const hoursWorked = Math.round(totalMinsWorked / 60 * 10) / 10

    const isOtOnly = OT_ONLY.includes(w.name)
    let baseWage = 0
    if (!isOtOnly) {
      baseWage = w.pay_type === 'weekly'
        ? Math.round((w.weekly_wage || 0) / 6 * present.length)
        : Math.round((w.hourly_rate || 0) * hoursWorked)
    }

    const netPay = baseWage - (isOtOnly ? 0 : totalLateDed) + totalOtPay

    return { ...w, daysPresent: present.length, daysAbsent: absent.length, hoursWorked, totalLateMins, totalLateDed: isOtOnly ? 0 : totalLateDed, totalOtMins, totalOtPay, baseWage, netPay, isOtOnly }
  })

  const totals = {
    base: payroll.reduce((s, p) => s + p.baseWage, 0),
    late: payroll.reduce((s, p) => s + p.totalLateDed, 0),
    ot: payroll.reduce((s, p) => s + p.totalOtPay, 0),
    net: payroll.reduce((s, p) => s + p.netPay, 0),
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Payroll</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">Wages summary</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-sand-300 rounded-xl px-3 py-2 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
          <span className="text-ink-400 text-sm">to</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-sand-300 rounded-xl px-3 py-2 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-sand-100 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-ink-400 uppercase mb-1">Base Wages</div><div className="text-xl font-extrabold text-ink-900">{pkr(totals.base)}</div></div>
        <div className="bg-red-50 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-red-600 uppercase mb-1">Late Deductions</div><div className="text-xl font-extrabold text-red-800">-{pkr(totals.late)}</div></div>
        <div className="bg-emerald-50 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-emerald-600 uppercase mb-1">Overtime Pay</div><div className="text-xl font-extrabold text-emerald-800">+{pkr(totals.ot)}</div></div>
        <div className="bg-ak-100 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-ak-900 uppercase mb-1">Net Payroll</div><div className="text-xl font-extrabold text-ak-900">{pkr(totals.net)}</div></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          <table className="ak-table">
            <thead><tr><th>Worker</th><th>Type</th><th className="text-center">Present</th><th className="text-center">Absent</th><th className="text-center">Hours</th><th className="text-right">Base</th><th className="text-right">Late</th><th className="text-right">OT</th><th className="text-right">Net</th></tr></thead>
            <tbody>
              {payroll.map(p => (
                <tr key={p.id}>
                  <td><div className="font-bold text-ink-800">{p.name}</div><div className="text-[0.6rem] text-ink-400">{p.role}</div></td>
                  <td><span className={'stage-badge ' + (p.isOtOnly ? 'bg-amber-100 text-amber-800' : 'bg-sand-200 text-ink-600')}>{p.isOtOnly ? 'OT Only' : (p.pay_type || 'hourly')}</span></td>
                  <td className="text-center"><span className="text-sm font-bold text-emerald-700">{p.daysPresent}</span></td>
                  <td className="text-center">{p.daysAbsent > 0 ? <span className="text-sm font-bold text-red-700">{p.daysAbsent}</span> : '—'}</td>
                  <td className="text-center text-sm font-mono text-ink-600">{p.hoursWorked}h</td>
                  <td className="text-right font-semibold">{p.isOtOnly ? <span className="text-ink-300">monthly</span> : pkr(p.baseWage)}</td>
                  <td className="text-right">{p.totalLateDed > 0 ? <span className="text-red-700 font-semibold">-{pkr(p.totalLateDed)}</span> : '—'}</td>
                  <td className="text-right">{p.totalOtPay > 0 ? <><span className="text-emerald-700 font-semibold">+{pkr(p.totalOtPay)}</span><div className="text-[0.55rem] text-emerald-500">+{p.totalOtMins}m</div></> : '—'}</td>
                  <td className="text-right font-extrabold text-ink-900">{pkr(p.netPay)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-sand-300 bg-sand-50">
                <td colSpan={5} className="font-extrabold text-ink-700 text-right">Totals</td>
                <td className="text-right font-bold">{pkr(totals.base)}</td>
                <td className="text-right font-bold text-red-700">{totals.late > 0 ? '-' + pkr(totals.late) : '—'}</td>
                <td className="text-right font-bold text-emerald-700">{totals.ot > 0 ? '+' + pkr(totals.ot) : '—'}</td>
                <td className="text-right font-extrabold text-ak-900 text-lg">{pkr(totals.net)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </AppShell>
  )
}
