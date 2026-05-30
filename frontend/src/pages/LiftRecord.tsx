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
      <h1 className="text-2xl font-bold">Lift Records</h1>

      {Object.keys(prs).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(prs).map(([type, pr]) => (
            <div key={type} className="bg-white p-4 rounded-xl border shadow-sm text-center">
              <span className="text-sm text-gray-500 capitalize">{type} PR</span>
              <p className="text-xl font-bold text-blue-600">{pr.weight_kg}kg × {pr.reps}</p>
              <span className="text-xs text-gray-400">{pr.date}</span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="grid md:grid-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Lift Type</label>
            <select {...register('lift_type')} className="w-full px-4 py-2 border rounded-lg">
              <option value="squat">Squat</option>
              <option value="bench">Bench</option>
              <option value="deadlift">Deadlift</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
            <input type="number" step="0.01" {...register('weight_kg')} className="w-full px-4 py-2 border rounded-lg" />
            {errors.weight_kg && <p className="text-red-500 text-sm">{errors.weight_kg.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reps</label>
            <input type="number" {...register('reps')} className="w-full px-4 py-2 border rounded-lg" />
            {errors.reps && <p className="text-red-500 text-sm">{errors.reps.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">RPE (6.0-10.0)</label>
            <input type="number" step="0.5" {...register('rpe')} className="w-full px-4 py-2 border rounded-lg" placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" {...register('lifted_at')} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input type="text" {...register('notes')} className="w-full px-4 py-2 border rounded-lg" placeholder="Optional" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : editing ? 'Update Lift' : 'Add Lift'}
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); reset() }} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 ml-2">
            Cancel
          </button>
        )}
      </form>

      <div className="flex gap-2 mb-4">
        {['', 'squat', 'bench', 'deadlift'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1 rounded-full text-sm ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            {f || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Weight</th>
              <th className="p-3 text-left">Reps</th>
              <th className="p-3 text-left">RPE</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lifts.map((lift) => (
              <tr key={lift.id} className="border-t">
                <td className="p-3 capitalize">{lift.lift_type}</td>
                <td className="p-3">{lift.weight_kg} kg</td>
                <td className="p-3">{lift.reps}</td>
                <td className="p-3">{lift.rpe || '-'}</td>
                <td className="p-3">{lift.lifted_at}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(lift)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(lift.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {lifts.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">No lift records yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
