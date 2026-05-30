import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getRecoveryLogs, createRecoveryLog, deleteRecoveryLog, getRecoverySummary } from '../api/recoveryApi'
import RecoverySummaryCard from '../components/RecoverySummaryCard'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { RecoveryLog, RecoverySummary } from '../types'
import FloatingChat from '../components/FloatingChat'
import { dashboardChat } from '../api/chatApi'

const schema = z.object({
  logged_at: z.string().min(1),
  sleep_hours: z.coerce.number().min(4).max(10),
  sleep_quality: z.coerce.number().int().min(1).max(10),
  stress_level: z.coerce.number().int().min(1).max(10),
  doms_level: z.coerce.number().int().min(1).max(5).optional().or(z.literal(0)),
  notes: z.string().optional(),
})

function calcRecoveryScore(sleepH: number, sleepQ: number, stress: number, doms?: number): number {
  let score = (sleepH / 9) * 30 + (sleepQ / 10) * 30 + ((10 - stress) / 10) * 25
  if (doms) score += ((5 - doms) / 4) * 15
  return Math.round(Math.min(Math.max(score, 0), 100) * 10) / 10
}

export default function RecoveryPage() {
  const [logs, setLogs] = useState<RecoveryLog[]>([])
  const [summary, setSummary] = useState<RecoverySummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewScore, setPreviewScore] = useState(0)

  const { register, handleSubmit, watch, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      logged_at: new Date().toISOString().split('T')[0],
      sleep_hours: 7,
      sleep_quality: 7,
      stress_level: 4,
      doms_level: 2,
    },
  })

  const watchSleepH = watch('sleep_hours')
  const watchSleepQ = watch('sleep_quality')
  const watchStress = watch('stress_level')
  const watchDoms = watch('doms_level')

  useEffect(() => {
    setPreviewScore(calcRecoveryScore(
      Number(watchSleepH) || 7,
      Number(watchSleepQ) || 7,
      Number(watchStress) || 5,
      Number(watchDoms) || undefined,
    ))
  }, [watchSleepH, watchSleepQ, watchStress, watchDoms])

  const fetchData = async () => {
    try {
      const [logsRes, summaryRes] = await Promise.all([
        getRecoveryLogs(7),
        getRecoverySummary(4),
      ])
      setLogs(logsRes.data.data?.logs || [])
      setSummary(summaryRes.data.data)
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchData() }, [])

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...data,
        doms_level: data.doms_level || undefined,
      }
      await createRecoveryLog(payload)
      reset({ logged_at: new Date().toISOString().split('T')[0], sleep_hours: 7, sleep_quality: 7, stress_level: 4, doms_level: 2, notes: '' })
      fetchData()
    } catch {
      setError('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteRecoveryLog(id)
      fetchData()
    } catch { /* ignore */ }
  }

  const chartData = logs.map((l) => ({
    date: l.logged_at.slice(5),
    score: calcRecoveryScore(l.sleep_hours, l.sleep_quality, l.stress_level, l.doms_level),
    sleep: l.sleep_hours,
  }))

  return (
    <div className="w-full space-y-10 animate-fade-in-up">
      <header>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-champagne">
          Recovery <span className="text-gold font-normal">Tracking</span>
        </h1>
        <p className="text-muted mt-1">Pantau kualitas tidur dan tingkat stres harian Anda.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-raised/50 backdrop-blur-md p-6 sm:p-8 border border-hairline rounded-2xl shadow-xl space-y-6">
        <h2 className="text-lg font-bold text-champagne">Log <span className="text-gold">Harian</span></h2>
        {error && <div className="bg-danger/10 text-danger p-4 rounded-xl text-sm border border-danger/20">{error}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Waktu Tidur</label>
                <span className="text-gold font-bold text-sm bg-gold/10 px-2 py-0.5 rounded-full">{String(watchSleepH ?? 7)} jam</span>
              </div>
              <input type="range" min="4" max="12" step="0.5" {...register('sleep_hours', { valueAsNumber: true })}
                className="w-full h-2 bg-lacquer rounded-lg appearance-none cursor-pointer accent-gold" />
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Kualitas Tidur</label>
                <span className="text-gold font-bold text-sm bg-gold/10 px-2 py-0.5 rounded-full">{String(watchSleepQ ?? 7)}/10</span>
              </div>
              <input type="range" min="1" max="10" {...register('sleep_quality', { valueAsNumber: true })}
                className="w-full h-2 bg-lacquer rounded-lg appearance-none cursor-pointer accent-gold" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Tingkat Stres</label>
                <span className="text-danger font-bold text-sm bg-danger/10 px-2 py-0.5 rounded-full">{String(watchStress ?? 5)}/10</span>
              </div>
              <input type="range" min="1" max="10" {...register('stress_level', { valueAsNumber: true })}
                className="w-full h-2 bg-lacquer rounded-lg appearance-none cursor-pointer accent-danger" />
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Tingkat DOMS</label>
                <span className="text-patina font-bold text-sm bg-patina/10 px-2 py-0.5 rounded-full">{watchDoms != null ? String(watchDoms) : '-'}/5</span>
              </div>
              <input type="range" min="1" max="5" {...register('doms_level', { valueAsNumber: true })}
                className="w-full h-2 bg-lacquer rounded-lg appearance-none cursor-pointer accent-patina" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-hairline/50">
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2">Tanggal</label>
            <input type="date" {...register('logged_at')}
              className="w-full px-4 py-3 bg-lacquer border border-hairline text-body rounded-xl focus:border-gold outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest block mb-2">Catatan Tambahan</label>
            <input type="text" {...register('notes')}
              className="w-full px-4 py-3 bg-lacquer border border-hairline text-body rounded-xl focus:border-gold outline-none text-sm transition-all" placeholder="Opsional..." />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-3 bg-lacquer/50 px-6 py-3 rounded-2xl border border-hairline">
            <span className="text-xs font-medium text-muted uppercase">Estimated Score:</span>
            <span className="text-3xl font-black text-gold animate-gold-pulse">{previewScore}</span>
          </div>
          <button type="submit" disabled={loading}
            className="w-full sm:w-auto px-12 py-4 bg-gold text-lacquer rounded-xl font-black shadow-lg shadow-gold/20 hover:bg-gold-dim transition-all uppercase tracking-widest text-sm disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Log Recovery Sekarang'}
          </button>
        </div>
      </form>

      {summary && (
        <section className="bg-raised/30 backdrop-blur-sm p-6 sm:p-8 border border-hairline rounded-2xl shadow-xl">
          <h2 className="text-lg font-bold text-champagne mb-6 uppercase tracking-widest opacity-80">Summary <span className="text-gold">7 Hari Terakhir</span></h2>
          <RecoverySummaryCard data={summary} />
        </section>
      )}

      {chartData.length > 0 && (
        <section className="bg-raised/30 backdrop-blur-sm p-6 sm:p-8 border border-hairline rounded-2xl shadow-xl">
          <h2 className="text-lg font-bold text-champagne mb-8 uppercase tracking-widest opacity-80">Recovery <span className="text-gold">Trend</span></h2>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#666" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ background: '#141210', border: '1px solid #2a2724', borderRadius: '12px', fontSize: 12, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }} 
                  itemStyle={{ color: '#c9a84c' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#c9a84c" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#141210', stroke: '#c9a84c', strokeWidth: 2 }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  name="Recovery Score" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section className="bg-raised/30 backdrop-blur-sm border border-hairline rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-hairline bg-hovered/30">
          <h2 className="font-semibold text-champagne">History Logs</h2>
        </div>
        <div className="divide-y divide-hairline/30">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-6 py-5 group hover:bg-hovered/20 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-sm font-bold text-champagne">{log.logged_at}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-lacquer border border-hairline rounded text-[10px] text-muted font-medium">💤 {log.sleep_hours}h</span>
                  <span className="px-2 py-0.5 bg-lacquer border border-hairline rounded text-[10px] text-muted font-medium">🌟 Q{log.sleep_quality}</span>
                  <span className="px-2 py-0.5 bg-lacquer border border-hairline rounded text-[10px] text-muted font-medium">⚡ S{log.stress_level}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(log.id)} className="text-danger opacity-0 group-hover:opacity-100 transition-all hover:scale-110 p-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-12 text-center text-muted italic text-sm">Belum ada riwayat log recovery.</div>
          )}
        </div>
      </section>
      <FloatingChat
        mode="dashboard"
        onSend={async (msg: string) => {
          const res = await dashboardChat(msg)
          return res.data.data.reply
        }}
      />
    </div>
  )
}
