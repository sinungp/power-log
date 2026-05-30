import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getBodyWeights, createBodyWeight, deleteBodyWeight, getLatestBodyWeight } from '../api/bodyWeightApi'
import BodyWeightChart from '../components/BodyWeightChart'
import type { BodyWeightLog, LatestBodyWeight } from '../types'
import FloatingChat from '../components/FloatingChat'
import { dashboardChat } from '../api/chatApi'

const schema = z.object({
  weight_kg: z.coerce.number().positive('Weight must be positive'),
  logged_at: z.string().min(1),
  notes: z.string().optional(),
})

export default function BodyWeightPage() {
  const [logs, setLogs] = useState<BodyWeightLog[]>([])
  const [latest, setLatest] = useState<LatestBodyWeight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { logged_at: new Date().toISOString().split('T')[0] },
  })

  const fetchData = async () => {
    try {
      const [logsRes, latestRes] = await Promise.all([
        getBodyWeights(12),
        getLatestBodyWeight('male').catch(() => null),
      ])
      setLogs(logsRes.data.data || [])
      if (latestRes) setLatest(latestRes.data.data)
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchData() }, [])

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')
    try {
      await createBodyWeight(data)
      reset({ logged_at: new Date().toISOString().split('T')[0], notes: '', weight_kg: undefined as any })
      fetchData()
    } catch {
      setError('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteBodyWeight(id)
      fetchData()
    } catch { /* ignore */ }
  }

  return (
    <>
      <div className="w-full space-y-10 animate-fade-in-up">
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-6 bg-raised/50 backdrop-blur-sm border-b border-hairline/30">
          <h1 className="text-2xl sm:text-3xl font-light text-champagne">Body Weight</h1>
          <p className="text-sm text-muted">Monitor weight and composition trends</p>
        </header>

        <main className="p-6">
          {latest && (
            <div className="bg-lacquer/50 p-6 sm:p-8 border border-hairline rounded-xl mb-6 group hover:border-gold/30 transition-all">
              <h2 className="text-lg font-bold text-champagne mb-4 flex items-center justify-between">
                Latest Weight & Class
                <span className="text-xs text-muted uppercase tracking-wider">({new Date().toLocaleDateString()})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Current Weight</p>
                  <p className="text-3xl font-black text-gold">{latest.weight_kg} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Weight Class</p>
                  <p className="text-2xl font-bold text-champagne">{latest.recommended_class}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Next Up</p>
                  <p className="text-lg font-bold text-patina">{latest.next_class_up || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Next Down</p>
                  <p className="text-lg font-bold text-danger">{latest.next_class_down || '-'}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="bg-lacquer/50 p-6 sm:p-8 border border-hairline rounded-xl space-y-6 mb-6">
            <h2 className="text-lg font-bold text-champagne mb-4">Log New Weight</h2>
            {error && <div className="bg-danger/10 text-danger p-3 rounded-xl text-sm border border-danger/20">{error}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-champagne mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('weight_kg')}
                  className="w-full px-4 py-3 bg-lacquer border border-hairline text-body rounded-xl focus:border-gold outline-none text-sm transition-all"
                  placeholder="e.g. 75.5"
                />
                {errors.weight_kg && <p className="text-danger text-[10px]">{errors.weight_kg.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-champagne mb-2">Date</label>
                <input
                  type="date"
                  {...register('logged_at')}
                  className="w-full px-4 py-3 bg-lacquer border border-hairline text-body rounded-xl focus:border-gold outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-champagne mb-2">Notes</label>
                <input
                  type="text"
                  {...register('notes')}
                  className="w-full px-4 py-3 bg-lacquer border border-hairline text-body rounded-xl focus:border-gold outline-none resize-none placeholder:text-muted text-sm" placeholder="Optional" />
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-gold text-lacquer rounded-xl font-semibold hover:bg-gold-dim transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                {loading ? 'Saving...' : 'Log Weight'}
              </button>
            </div>
          </form>

          <div className="bg-lacquer/50 p-6 sm:p-8 border border-hairline rounded-xl mb-6">
            <h2 className="text-lg font-bold text-champagne mb-4">Weight Trend</h2>
            <BodyWeightChart data={logs} recommendedClass={latest?.recommended_class} />
          </div>

          <div className="bg-lacquer/50 p-6 sm:p-8 border border-hairline rounded-xl">
            <h2 className="text-lg font-bold text-champagne mb-4">History</h2>
            <div className="divide-y divide-hairline/30">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between px-4 py-4 group hover:bg-hovered/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-champagne">{log.weight_kg} kg</span>
                    <span className="text-xs text-muted ml-2">{log.logged_at}</span>
                    {log.notes && <span className="text-xs text-muted ml-1">— {log.notes}</span>}
                  </div>
                  <button onClick={() => handleDelete(log.id)} className="text-danger hover:underline text-xs">Delete</button>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="p-6 text-center text-muted text-sm">No weight logs yet</p>
              )}
            </div>
          </div>
        </main>
      </div>
      <FloatingChat
        mode="dashboard"
        onSend={async (msg: string) => {
          const res = await dashboardChat(msg)
          return res.data.data.reply
        }}
      />
    </>
  )
}
