import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getBodyWeights, createBodyWeight, deleteBodyWeight, getLatestBodyWeight } from '../api/bodyWeightApi'
import BodyWeightChart from '../components/BodyWeightChart'
import type { BodyWeightLog, LatestBodyWeight } from '../types'

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
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-light text-champagne">Body Weight</h1>
        <p className="text-muted text-sm sm:text-base">Track your body weight and weight class</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-raised p-4 sm:p-6 border border-hairline space-y-4">
        {error && <div className="bg-danger/10 text-danger p-3 text-sm">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              {...register('weight_kg')}
              className="w-full px-3 sm:px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm"
              placeholder="e.g. 75.5"
            />
            {errors.weight_kg && <p className="text-danger text-xs mt-1">{errors.weight_kg.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Date</label>
            <input
              type="date"
              {...register('logged_at')}
              className="w-full px-3 sm:px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Notes</label>
            <input
              type="text"
              {...register('notes')}
              className="w-full px-3 sm:px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm"
              placeholder="Optional"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gold text-lacquer rounded-sm font-semibold hover:bg-gold-dim disabled:opacity-50 text-sm"
        >
          {loading ? 'Saving...' : 'Log Weight'}
        </button>
      </form>

      {latest && (
        <div className="bg-raised p-4 sm:p-6 border border-hairline">
          <h2 className="font-semibold text-champagne mb-3">Latest Weight & Class</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-lacquer p-3 border border-hairline">
              <p className="text-xs text-muted">Current Weight</p>
              <p className="text-lg font-bold text-gold">{latest.weight_kg} kg</p>
            </div>
            <div className="bg-lacquer p-3 border border-hairline">
              <p className="text-xs text-muted">Class</p>
              <p className="text-lg font-bold text-champagne">{latest.recommended_class}</p>
            </div>
            <div className="bg-lacquer p-3 border border-hairline">
              <p className="text-xs text-muted">Next Up</p>
              <p className="text-lg font-bold text-patina">{latest.next_class_up || '-'}</p>
            </div>
            <div className="bg-lacquer p-3 border border-hairline">
              <p className="text-xs text-muted">Next Down</p>
              <p className="text-lg font-bold text-danger">{latest.next_class_down || '-'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-raised p-4 sm:p-6 border border-hairline">
        <h2 className="font-semibold text-champagne mb-4">Weight Trend</h2>
        <BodyWeightChart data={logs} recommendedClass={latest?.recommended_class} />
      </div>

      <div className="bg-raised border border-hairline">
        <div className="p-4 border-b border-hairline">
          <h2 className="font-semibold text-champagne">History</h2>
        </div>
        <div className="divide-y divide-hairline">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 sm:p-4">
              <div>
                <span className="font-medium text-champagne">{log.weight_kg} kg</span>
                <span className="text-muted text-xs ml-2">{log.logged_at}</span>
                {log.notes && <span className="text-muted text-xs ml-2">— {log.notes}</span>}
              </div>
              <button onClick={() => handleDelete(log.id)} className="text-danger hover:underline text-xs">Delete</button>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="p-6 text-center text-muted text-sm">No weight logs yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
