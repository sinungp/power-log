import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axiosInstance from '../api/axiosInstance'
import type { ApiResponse, LiftRecord } from '../types'

const schema = z.object({
  lift_type: z.enum(['squat', 'bench', 'deadlift']),
  weight_kg: z.coerce.number().positive(),
  reps: z.coerce.number().int().positive(),
  rpe: z.coerce.number().min(6).max(10).optional().or(z.literal(0)),
  notes: z.string().optional(),
  lifted_at: z.string().min(1),
})

interface PRSummary {
  lift_type: string
  weight_kg: number
  reps: number
  date: string
}

export default function LiftRecord() {
  const [lifts, setLifts] = useState<LiftRecord[]>([])
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [prs, setPrs] = useState<Record<string, PRSummary>>({})

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { lifted_at: new Date().toISOString().split('T')[0] },
  })

  const fetchLifts = async () => {
    try {
      const params = filter ? `?lift_type=${filter}` : ''
      const [liftsRes, summaryRes] = await Promise.all([
        axiosInstance.get<ApiResponse<LiftRecord[]>>(`/lifts${params}`),
        axiosInstance.get<ApiResponse<Record<string, { lift_type: string; weight_kg: number; reps: number; date: string }>>>('/lifts/summary'),
      ])
      setLifts(liftsRes.data.data || [])
      setPrs(summaryRes.data.data || {})
    } catch {
      // ignore
    }
  }

  useEffect(() => { fetchLifts() }, [filter])

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        rpe: data.rpe || undefined,
        notes: data.notes || undefined,
      }
      if (editing) {
        await axiosInstance.put(`/lifts/${editing}`, payload)
        setEditing(null)
      } else {
        await axiosInstance.post('/lifts', payload)
      }
      reset({ lifted_at: new Date().toISOString().split('T')[0] })
      fetchLifts()
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (lift: LiftRecord) => {
    setEditing(lift.id)
    reset({
      lift_type: lift.lift_type,
      weight_kg: lift.weight_kg,
      reps: lift.reps,
      rpe: lift.rpe || 0,
      notes: lift.notes || '',
      lifted_at: lift.lifted_at,
    })
  }

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/lifts/${id}`)
      fetchLifts()
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-light text-champagne">Lift Records</h1>

      {Object.keys(prs).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(prs).map(([type, pr]) => (
            <div key={type} className="bg-raised p-4 border border-hairline text-center">
              <span className="text-sm text-muted capitalize">{type} PR</span>
              <p className="text-xl font-bold text-gold">{pr.weight_kg}kg x {pr.reps}</p>
              <span className="text-xs text-muted">{pr.date}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-raised p-6 border border-hairline space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Lift Type</label>
            <select {...register('lift_type')} className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none">
              <option value="squat">Squat</option>
              <option value="bench">Bench</option>
              <option value="deadlift">Deadlift</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Weight (kg)</label>
            <input type="number" step="0.01" {...register('weight_kg')} className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none" />
            {errors.weight_kg && <p className="text-danger text-sm">{errors.weight_kg.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Reps</label>
            <input type="number" {...register('reps')} className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none" />
            {errors.reps && <p className="text-danger text-sm">{errors.reps.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">RPE (6.0-10.0)</label>
            <input type="number" step="0.5" {...register('rpe')} className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none placeholder:text-muted" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Date</label>
            <input type="date" {...register('lifted_at')} className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Notes</label>
            <input type="text" {...register('notes')} className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none placeholder:text-muted" placeholder="Optional" />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-gold text-lacquer rounded-sm font-semibold hover:bg-gold-dim disabled:opacity-50">
            {loading ? 'Saving...' : editing ? 'Update Lift' : 'Add Lift'}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); reset() }} className="px-6 py-2 border border-hairline text-muted rounded-sm hover:bg-hovered hover:text-champagne">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex gap-2 mb-4">
        {['', 'squat', 'bench', 'deadlift'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1 text-sm rounded-sm ${filter === f ? 'bg-gold text-lacquer' : 'border border-hairline text-muted hover:bg-hovered hover:text-champagne'}`}>
            {f || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-raised border border-hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-lacquer">
            <tr>
              <th className="p-3 text-left text-muted font-medium">Type</th>
              <th className="p-3 text-left text-muted font-medium">Weight</th>
              <th className="p-3 text-left text-muted font-medium">Reps</th>
              <th className="p-3 text-left text-muted font-medium">RPE</th>
              <th className="p-3 text-left text-muted font-medium">Date</th>
              <th className="p-3 text-left text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lifts.map((lift) => (
              <tr key={lift.id} className="border-t border-hairline">
                <td className="p-3 capitalize text-champagne">{lift.lift_type}</td>
                <td className="p-3 text-body">{lift.weight_kg} kg</td>
                <td className="p-3 text-body">{lift.reps}</td>
                <td className="p-3 text-body">{lift.rpe || '-'}</td>
                <td className="p-3 text-muted">{lift.lifted_at}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(lift)} className="text-gold hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(lift.id)} className="text-danger hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {lifts.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted">No lift records yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
