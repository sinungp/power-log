import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axiosInstance from '../api/axiosInstance'
import type { ApiResponse, OneRMResults } from '../types'

const schema = z.object({
  weight_kg: z.coerce.number().positive('Weight must be positive'),
  reps: z.coerce.number().int().positive('Reps must be positive'),
})

export default function Calculator() {
  const [result, setResult] = useState<OneRMResults | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await axiosInstance.post<ApiResponse<OneRMResults>>('/calculator/one-rm', data)
      setResult(res.data.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-light text-champagne">1RM Calculator</h1>
        <p className="text-muted">Calculate your one-rep max using multiple formulas</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-raised p-6 border border-hairline space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              {...register('weight_kg')}
              className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none placeholder:text-muted"
              placeholder="e.g. 100"
            />
            {errors.weight_kg && <p className="text-danger text-sm mt-1">{errors.weight_kg.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Reps</label>
            <input
              type="number"
              {...register('reps')}
              className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none placeholder:text-muted"
              placeholder="e.g. 5"
            />
            {errors.reps && <p className="text-danger text-sm mt-1">{errors.reps.message}</p>}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gold text-lacquer rounded-sm font-semibold hover:bg-gold-dim disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate 1RM'}
        </button>
      </form>

      {result && (
        <div className="bg-raised p-6 border border-hairline">
          <h2 className="font-semibold text-champagne mb-4">Results</h2>
          {result.warning && (
            <div className="bg-danger/10 text-danger p-3 text-sm mb-4">{result.warning}</div>
          )}
          <div className="grid gap-3">
            <div className="flex justify-between items-center p-3 bg-lacquer border border-hairline">
              <span className="font-medium text-champagne">Epley</span>
              <span className="text-xl font-bold text-gold">{result.epley} kg</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-lacquer border border-hairline">
              <span className="font-medium text-champagne">Brzycki</span>
              <span className="text-xl font-bold text-gold">{result.brzycki} kg</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-lacquer border border-hairline">
              <span className="font-medium text-champagne">Lombardi</span>
              <span className="text-xl font-bold text-gold">{result.lombardi} kg</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
