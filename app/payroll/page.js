'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, pkr, today, STAGES } from '@/lib/supabase'

const EXCLUDE = ['Shahbaz', 'Ayesha', 'Khizar', 'Umer', 'Rijah']
const OT_ONLY = ['Ashfaq', 'Sikandar', 'Shafeeq']
const PIECE_RATE = ['Qadir', 'Safdar']
const POST_STITCH = ['QC', 'Packed', 'Dispatched']

function getPresetRange(preset) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate(), day = now.getDay()
  switch (preset) {
    case 'week': {
      const mon = new Date(now); mon.setDate(d - (day === 0 ? 6 : day - 1))
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
      return [mon.toISOString().slice(0,10), sun.toISOString().slice(0,10)]
    }
    case 'month': return [`${y}-${String(m+1).padStart(2,'0')}-01`, now.toISOString().slice(0,10)]
    case 'ytd': return [`${y}-01-01`, now.toISOString().slice(0,10)]
    default: return ['', '']
  }
}

export default function PayrollPage() {
  const [workers, setWorkers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [unitCards, setUnitCards] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedWorker, setExpandedWorker] = useState(null)

  const [datePreset, setDatePreset] = useState('week')
  const [startDate, setStartDate] = useState(() => getPresetRange('week')[0])
  const [endDate, setEndDate] = useState(() => getPresetRange('week')[1])

  function applyPreset(p) {
    setDatePreset(p)
    if (p !== 'custom') { const [f, t] = getPresetRange(p); setStartDate(f); setEndDate(t) }
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [wRes, aRes, ucRes, pRes] = await Promise.all([
      supabase.from('workers').select('*').eq('is_active', true).order('name'),
      supabase.from('attendance').select('*').gte('date', startDate).lte('date', endDate),
      // Get ALL unit cards that are past stitching — no date filter on cards themselves
      // We use the card's master field to determine who stitched it
      supabase.from('unit_cards').select('id, order_id, product_id, product_label, master, stitch_master, current_stage, stitch_rate, updated_at'),
      supabase.from('products').select('id, stitch_rate, label'),
    ])
    setWorkers((wRes.data || []).filter(w => !EXCLUDE.includes(w.name)))
    setAttendance(aRes.data || [])
    setUnitCards(ucRes.data || [])
    setProducts(pRes.data || [])
    setLoading(false)
  }, [startDate, endDate])

  useEffect(() => { load() }, [load])

  const productRates = useMemo(() => {
    const map = {}
    products.forEach(p => { map[p.id] = p.stitch_rate || 0 })
    return map
  }, [products])

  // Piece-rate calculation — SIMPLE AND RELIABLE
  // Count unit cards where:
  //   1. master is Qadir or Safdar
  //   2. current_stage is past stitching (QC, Packed, or Dispatched)
  //   3. updated_at falls within the selected date range
  // This means: the card was stitched and moved forward during this period
  const pieceRateData = useMemo(() => {
    const result = {}
    PIECE_RATE.forEach(name => { result[name] = { pieces: 0, totalPay: 0, details: [] } })

    unitCards.forEach(card => {
      // Use stitch_master field (locked at Stitching stage), fall back to master for legacy cards
      const stitcher = card.stitch_master || card.master
      if (!PIECE_RATE.includes(stitcher)) return
      if (!POST_STITCH.includes(card.current_stage)) return

      const cardDate = card.updated_at?.slice(0, 10)
      if (!cardDate) return
      if (cardDate < startDate || cardDate > endDate) return

      const rate = card.stitch_rate || productRates[card.product_id] || 0
      const w = result[stitcher]
      if (w && !w.details.find(d => d.cardId === card.id)) {
        w.pieces += 1
        w.totalPay += rate
        w.details.push({ cardId: card.id, label: card.product_label, rate })
      }
    })

    return result
  }, [unitCards, startDate, endDate, productRates])

  const payroll = useMemo(() => {
    return workers.map(w => {
      const isPieceRate = PIECE_RATE.includes(w.name)
      const isOtOnly = OT_ONLY.includes(w.name)

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

      let baseWage = 0, pieces = 0, pieceDetails = []
      if (isPieceRate) {
        const pd = pieceRateData[w.name] || { pieces: 0, totalPay: 0, details: [] }
        baseWage = pd.totalPay; pieces = pd.pieces; pieceDetails = pd.details
      } else if (!isOtOnly) {
        baseWage = w.pay_type === 'weekly'
          ? Math.round((w.weekly_wage || 0) / 6 * present.length)
          : Math.round((w.hourly_rate || 0) * hoursWorked)
      }

      const netPay = baseWage - (isPieceRate || isOtOnly ? 0 : totalLateDed) + totalOtPay

      return {
        ...w, daysPresent: present.length, daysAbsent: absent.length,
        hoursWorked, totalLateMins, totalLateDed: (isPieceRate || isOtOnly) ? 0 : totalLateDed,
        totalOtMins, totalOtPay, baseWage, netPay,
        isPieceRate, isOtOnly, pieces, pieceDetails,
      }
    })
  }, [workers, attendance, pieceRateData])

  const totals = {
    base: payroll.reduce((s, p) => s + p.baseWage, 0),
    late: payroll.reduce((s, p) => s + p.totalLateDed, 0),
    ot: payroll.reduce((s, p) => s + p.totalOtPay, 0),
    net: payroll.reduce((s, p) => s + p.netPay, 0),
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Payroll</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">Wages summary</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {[['week','This Week'], ['month','This Month'], ['ytd','YTD'], ['custom','Custom']].map(([k, l]) => (
          <button key={k} onClick={() => applyPreset(k)}
            className={'px-3 py-1.5 text-xs font-bold rounded-lg transition-all ' + (datePreset === k ? 'bg-ak-900 text-white' : 'bg-sand-100 text-ink-400 hover:text-ink-600')}>{l}</button>
        ))}
        <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setDatePreset('custom') }}
          className="border border-sand-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
        <span className="text-xs text-ink-400">to</span>
        <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setDatePreset('custom') }}
          className="border border-sand-300 rounded-lg px-2 py-1.5 text-xs font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-sand-100 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-ink-400 uppercase mb-1">Base + Piece-Rate</div><div className="text-xl font-extrabold text-ink-900">{pkr(totals.base)}</div></div>
        <div className="bg-red-50 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-red-600 uppercase mb-1">Late Deductions</div><div className="text-xl font-extrabold text-red-800">-{pkr(totals.late)}</div></div>
        <div className="bg-emerald-50 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-emerald-600 uppercase mb-1">Overtime Pay</div><div className="text-xl font-extrabold text-emerald-800">+{pkr(totals.ot)}</div></div>
        <div className="bg-ak-100 rounded-2xl p-5"><div className="text-[0.65rem] font-bold tracking-[0.12em] text-ak-900 uppercase mb-1">Net Payroll</div><div className="text-xl font-extrabold text-ak-900">{pkr(totals.net)}</div></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          <table className="ak-table">
            <thead><tr><th>Worker</th><th>Pay Type</th><th className="text-center">Present</th><th className="text-center">Pieces</th><th className="text-center">Hours</th><th className="text-right">Earnings</th><th className="text-right">Late</th><th className="text-right">OT</th><th className="text-right">Net</th></tr></thead>
            <tbody>
              {payroll.map(p => (
                <>{/* Fragment needed for expand row */}
                  <tr key={p.id} className={p.isPieceRate ? 'cursor-pointer' : ''} onClick={() => p.isPieceRate && setExpandedWorker(expandedWorker === p.name ? null : p.name)}>
                    <td><div className="font-bold text-ink-800">{p.name}</div><div className="text-[0.6rem] text-ink-400">{p.role}</div></td>
                    <td><span className={'stage-badge ' + (p.isPieceRate ? 'bg-purple-100 text-purple-800' : p.isOtOnly ? 'bg-amber-100 text-amber-800' : 'bg-sand-200 text-ink-600')}>{p.isPieceRate ? 'Per Piece' : p.isOtOnly ? 'OT Only' : (p.pay_type || 'hourly')}</span></td>
                    <td className="text-center"><span className="text-sm font-bold text-emerald-700">{p.daysPresent}</span></td>
                    <td className="text-center">{p.isPieceRate ? <span className="text-sm font-bold text-purple-700">{p.pieces}</span> : '—'}</td>
                    <td className="text-center text-sm font-mono text-ink-600">{p.hoursWorked}h</td>
                    <td className="text-right font-semibold">{p.isPieceRate ? <span className="text-purple-700">{pkr(p.baseWage)}</span> : p.isOtOnly ? <span className="text-ink-300">monthly</span> : pkr(p.baseWage)}</td>
                    <td className="text-right">{p.totalLateDed > 0 ? <span className="text-red-700 font-semibold">-{pkr(p.totalLateDed)}</span> : '—'}</td>
                    <td className="text-right">{p.totalOtPay > 0 ? <><span className="text-emerald-700 font-semibold">+{pkr(p.totalOtPay)}</span><div className="text-[0.55rem] text-emerald-500">+{p.totalOtMins}m</div></> : '—'}</td>
                    <td className="text-right font-extrabold text-ink-900">{pkr(p.netPay)}</td>
                  </tr>
                  {p.isPieceRate && expandedWorker === p.name && p.pieceDetails.length > 0 && (
                    <tr key={p.id + '-detail'}>
                      <td colSpan={9} className="bg-purple-50/50 px-6 py-3">
                        <div className="text-[0.65rem] font-bold text-purple-800 uppercase tracking-wider mb-2">Completed pieces — {p.pieces} total</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {Object.entries(
                            p.pieceDetails.reduce((acc, d) => {
                              const key = d.label + '|' + d.rate
                              if (!acc[key]) acc[key] = { label: d.label, rate: d.rate, count: 0 }
                              acc[key].count++
                              return acc
                            }, {})
                          ).map(([key, d]) => (
                            <div key={key} className="flex justify-between text-xs py-1 border-b border-purple-100 last:border-0">
                              <span className="text-ink-700 font-semibold">{d.label} <span className="text-ink-400">×{d.count}</span></span>
                              <span className="font-bold text-purple-700">{pkr(d.rate * d.count)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
