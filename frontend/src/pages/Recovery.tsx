import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getRecoveryLogs, createRecoveryLog, deleteRecoveryLog, getRecoverySummary } from '../api/recoveryApi'
import RecoverySummaryCard from '../components/RecoverySummaryCard'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { RecoveryLog, RecoverySummary } from '../types'

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
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-light text-champagne">Recovery</h1>
        <p className="text-muted text-sm sm:text-base">Track sleep, stress, and recovery</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-raised p-4 sm:p-6 border border-hairline space-y-4">
        {error && <div className="bg-danger/10 text-danger p-3 text-sm">{error}</div>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Sleep Hours</label>
            <input type="range" min="4" max="10" step="0.5" {...register('sleep_hours', { valueAsNumber: true })}
              className="w-full accent-gold" />
            <span className="text-xs text-muted">{String(watchSleepH ?? 7)} hrs</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Sleep Quality</label>
            <input type="range" min="1" max="10" {...register('sleep_quality', { valueAsNumber: true })}
              className="w-full accent-gold" />
            <span className="text-xs text-muted">{String(watchSleepQ ?? 7)}/10</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Stress Level</label>
            <input type="range" min="1" max="10" {...register('stress_level', { valueAsNumber: true })}
              className="w-full accent-gold" />
            <span className="text-xs text-muted">{String(watchStress ?? 5)}/10</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">DOMS (optional)</label>
            <input type="range" min="1" max="5" {...register('doms_level', { valueAsNumber: true })}
              className="w-full accent-gold" />
            <span className="text-xs text-muted">{watchDoms != null ? String(watchDoms) : '-'}/5</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Date</label>
            <input type="date" {...register('logged_at')}
              className="w-full px-3 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Notes</label>
            <input type="text" {...register('notes')}
              className="w-full px-3 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" placeholder="Optional" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted">Recovery Score: </span>
            <span className="text-gold font-bold">{previewScore}</span>
          </div>
          <button type="submit" disabled={loading}
            className="px-6 py-2 bg-gold text-lacquer rounded-sm font-semibold hover:bg-gold-dim disabled:opacity-50 text-sm">
            {loading ? 'Saving...' : 'Log Recovery'}
          </button>
        </div>
      </form>

      {summary && (
        <div className="bg-raised p-4 sm:p-6 border border-hairline">
          <h2 className="font-semibold text-champagne mb-4">Recovery Summary (7 days)</h2>
          <RecoverySummaryCard data={summary} />
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-raised p-4 sm:p-6 border border-hairline">
          <h2 className="font-semibold text-champagne mb-4">Recovery Trend</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(20% 0.005 95)" />
                <XAxis dataKey="date" stroke="oklch(45% 0.005 95)" fontSize={11} />
                <YAxis stroke="oklch(45% 0.005 95)" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'oklch(11% 0.005 95)', border: '1px solid oklch(20% 0.005 95)', borderRadius: 0, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="oklch(84% 0.19 80.46)" strokeWidth={2} dot={{ r: 3 }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-raised border border-hairline">
        <div className="p-4 border-b border-hairline">
          <h2 className="font-semibold text-champagne">Recent Logs</h2>
        </div>
        <div className="divide-y divide-hairline">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 sm:p-4">
              <div className="text-sm">
                <span className="text-champagne font-medium">{log.logged_at}</span>
                <span className="text-muted ml-2">{log.sleep_hours}h · Q{log.sleep_quality} · S{log.stress_level}</span>
                {log.doms_level && <span className="text-muted ml-1">· DOMS {log.doms_level}</span>}
              </div>
              <button onClick={() => handleDelete(log.id)} className="text-danger hover:underline text-xs">Delete</button>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="p-6 text-center text-muted text-sm">No recovery logs yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
