'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import AppShell from '@/components/AppShell'
import { supabase, today } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/components/AuthProvider'

// Workers excluded from attendance entirely (paid per piece)
const EXCLUDE = ['Qadir', 'Safdar']

// Directors: no late/OT at all (monthly salary, no deductions)
const DIRECTORS = ['Shahbaz', 'Ayesha', 'Rijah']

// Management: no deductions/additions but visible for tracking
const MANAGEMENT = ['Umer', 'Khizar']

// Monthly with OT only (no late deductions)
const MONTHLY_OT = ['Ashfaq', 'Sikandar', 'Shafeeq']

// Custom sort order
const SORT_ORDER = [
  'Shahbaz', 'Ayesha', 'Rijah', 'Umer', 'Khizar',
  'Ashfaq', 'Sikandar', 'Shafeeq',
  'Amir', 'Dilshad', 'Honey', 'Imran', 'Irfan', 'Rashid', 'Shafiq',
]

function workerSort(a, b) {
  const ai = SORT_ORDER.indexOf(a.name)
  const bi = SORT_ORDER.indexOf(b.name)
  if (ai >= 0 && bi >= 0) return ai - bi
  if (ai >= 0) return -1
  if (bi >= 0) return 1
  return a.name.localeCompare(b.name)
}

export default function AttendancePage() {
  const toast = useToast()
  const { user } = useAuth()
  const [workers, setWorkers] = useState([])
  const [records, setRecords] = useState([])
  const [date, setDate] = useState(today())
  const [loading, setLoading] = useState(true)
  const [timeInputs, setTimeInputs] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    const [wRes, aRes] = await Promise.all([
      supabase.from('workers').select('*').eq('is_active', true).order('name'),
      supabase.from('attendance').select('*').eq('date', date),
    ])
    const filtered = (wRes.data || []).filter(w => !EXCLUDE.includes(w.name)).sort(workerSort)
    setWorkers(filtered)
    setRecords(aRes.data || [])
    const inputs = {}
    ;(aRes.data || []).forEach(r => {
      inputs[r.worker_id] = { time_in: r.time_in?.slice(0, 5) || '', time_out: r.time_out?.slice(0, 5) || '' }
    })
    setTimeInputs(inputs)
    setLoading(false)
  }, [date])

  useEffect(() => { load() }, [load])

  function getRecord(wId) { return records.find(r => r.worker_id === wId) }
  function setWT(wId, field, val) { setTimeInputs(p => ({ ...p, [wId]: { ...(p[wId] || { time_in: '', time_out: '' }), [field]: val } })) }
  function useNow(wId, field) { setWT(wId, field, new Date().toTimeString().slice(0, 5)) }

  function getWorkerConfig(name) {
    if (DIRECTORS.includes(name)) return { showLate: false, showOT: false, tag: 'Director', tagColor: 'bg-purple-100 text-purple-800' }
    if (MANAGEMENT.includes(name)) return { showLate: false, showOT: false, tag: 'Management', tagColor: 'bg-blue-100 text-blue-800' }
    if (MONTHLY_OT.includes(name)) return { showLate: false, showOT: true, tag: 'Monthly+OT', tagColor: 'bg-amber-100 text-amber-800' }
    return { showLate: true, showOT: true, tag: null, tagColor: '' }
  }

  function calcLateOt(tIn, tOut, w) {
    const cfg = getWorkerConfig(w.name)
    let lateMins = 0, lateDed = 0, otMins = 0, otPay = 0
    if (tIn && cfg.showLate) {
      const [ih, im] = tIn.split(':').map(Number)
      const diff = (ih * 60 + im) - (9 * 60) - 15
      if (diff > 0) { lateMins = diff; lateDed = Math.round((w.hourly_rate || 0) * diff / 60) }
    }
    if (tOut && cfg.showOT) {
      const [oh, om] = tOut.split(':').map(Number)
      const diff = (oh * 60 + om) - (18 * 60)
      if (diff > 0) { otMins = diff; otPay = Math.round((w.hourly_rate || 0) * diff / 60) }
    }
    return { lateMins, lateDed, otMins, otPay }
  }

  async function saveAttendance(w) {
    const existing = getRecord(w.id)
    const inp = timeInputs[w.id] || {}
    const { lateMins, lateDed, otMins, otPay } = calcLateOt(inp.time_in, inp.time_out, w)
    const payload = {
      worker_id: w.id, worker_name: w.name, date,
      time_in: inp.time_in ? inp.time_in + ':00' : null,
      time_out: inp.time_out ? inp.time_out + ':00' : null,
      late_mins: lateMins, late_deduction: lateDed,
      ot_mins: otMins, ot_pay: otPay, logged_by: user?.id,
    }
    const { error } = existing
      ? await supabase.from('attendance').update(payload).eq('id', existing.id)
      : await supabase.from('attendance').insert(payload)
    if (error) return toast(error.message, 'error')
    toast(w.name + ' saved', 'success'); load()
  }

  async function markAbsent(w) {
    const existing = getRecord(w.id)
    const payload = { worker_id: w.id, worker_name: w.name, date, time_in: null, time_out: null, late_mins: 0, late_deduction: 0, ot_mins: 0, ot_pay: 0, logged_by: user?.id }
    const { error } = existing ? await supabase.from('attendance').update(payload).eq('id', existing.id) : await supabase.from('attendance').insert(payload)
    if (error) return toast(error.message, 'error')
    toast(w.name + ' absent', 'success'); load()
  }

  async function deleteRecord(w) {
    const existing = getRecord(w.id)
    if (!existing) return
    const { error } = await supabase.from('attendance').delete().eq('id', existing.id)
    if (error) return toast(error.message, 'error')
    setTimeInputs(p => { const n = { ...p }; delete n[w.id]; return n })
    toast(w.name + ' removed', 'success'); load()
  }

  const presentCount = records.filter(r => r.time_in).length
  const absentCount = records.filter(r => !r.time_in && r.worker_id).length

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Attendance</h1>
          <p className="text-sm text-ink-400 font-semibold mt-0.5">{presentCount} present · {absentCount} absent · {workers.length - records.filter(r => workers.some(w => w.id === r.worker_id)).length} unmarked</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(today())} className="text-xs font-bold text-ak-900 bg-ak-100 px-3 py-2 rounded-xl hover:bg-ak-100/80">Today</button>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-sand-300 rounded-xl px-3 py-2 text-sm font-semibold bg-sand-50 focus:outline-none focus:ring-2 focus:ring-ak-900/20" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-ak-900 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          <table className="ak-table">
            <thead><tr><th>Worker</th><th>Time In</th><th>Time Out</th><th>Late</th><th>OT</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {workers.map(w => {
                const rec = getRecord(w.id)
                const inp = timeInputs[w.id] || { time_in: '', time_out: '' }
                const isAbsent = rec && !rec.time_in
                const cfg = getWorkerConfig(w.name)
                const { lateMins, otMins } = calcLateOt(inp.time_in, inp.time_out, w)

                return (
                  <tr key={w.id} className={isAbsent ? 'bg-red-50/40' : ''}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-bold text-ink-800">{w.name}</div>
                          <div className="text-[0.6rem] text-ink-400">{w.role}</div>
                        </div>
                        {cfg.tag && <span className={'text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full ' + cfg.tagColor}>{cfg.tag}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <input type="time" value={inp.time_in} onChange={e => setWT(w.id, 'time_in', e.target.value)} disabled={isAbsent}
                          className="border border-sand-300 rounded-lg px-2 py-1.5 text-sm font-mono bg-sand-50 w-[105px] focus:outline-none focus:ring-2 focus:ring-ak-900/20 disabled:opacity-30" />
                        <button onClick={() => useNow(w.id, 'time_in')} title="Now" className="text-[0.6rem] text-ink-400 hover:text-ak-900 px-0.5">⏱</button>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <input type="time" value={inp.time_out} onChange={e => setWT(w.id, 'time_out', e.target.value)} disabled={isAbsent}
                          className="border border-sand-300 rounded-lg px-2 py-1.5 text-sm font-mono bg-sand-50 w-[105px] focus:outline-none focus:ring-2 focus:ring-ak-900/20 disabled:opacity-30" />
                        <button onClick={() => useNow(w.id, 'time_out')} title="Now" className="text-[0.6rem] text-ink-400 hover:text-ak-900 px-0.5">⏱</button>
                      </div>
                    </td>
                    <td>{cfg.showLate && lateMins > 0 ? <span className="text-xs font-bold text-amber-700">{lateMins}m</span> : <span className="text-ink-300">—</span>}</td>
                    <td>{cfg.showOT && otMins > 0 ? <span className="text-xs font-bold text-emerald-700">+{otMins}m</span> : <span className="text-ink-300">—</span>}</td>
                    <td>{rec ? (isAbsent ? <span className="stage-badge bg-red-100 text-red-800">absent</span> : <span className="stage-badge bg-emerald-100 text-emerald-800">present</span>) : <span className="text-xs text-ink-300">—</span>}</td>
                    <td className="text-right">
                      <div className="flex gap-1 justify-end">
                        {!isAbsent && <button onClick={() => saveAttendance(w)} className="text-[0.65rem] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg hover:bg-emerald-200">{rec ? 'Update' : 'Save'}</button>}
                        <button onClick={() => markAbsent(w)} className="text-[0.65rem] font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded-lg hover:bg-red-200">Absent</button>
                        {rec && <button onClick={() => deleteRecord(w)} className="text-[0.65rem] font-bold bg-sand-200 text-ink-500 px-2 py-1 rounded-lg hover:bg-sand-300">✕</button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}
