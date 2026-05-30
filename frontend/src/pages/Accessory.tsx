import { useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'
import type { ApiResponse, Accessory } from '../types'

const targets = ['squat', 'bench', 'deadlift', 'general'] as const
const difficulties = ['beginner', 'intermediate', 'advanced'] as const

export default function AccessoryPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [target, setTarget] = useState<string>('squat')
  const [difficulty, setDifficulty] = useState<string>('')

  useEffect(() => {
    const params = new URLSearchParams({ target })
    if (difficulty) params.set('difficulty', difficulty)
    axiosInstance.get<ApiResponse<Accessory[]>>(`/accessories?${params}`)
      .then((res) => setAccessories(res.data.data || []))
      .catch(() => {})
  }, [target, difficulty])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Exercise Accessories</h1>

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {targets.map((t) => (
            <button key={t} onClick={() => setTarget(t)} className={`px-4 py-2 rounded-lg capitalize text-sm ${target === t ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="px-4 py-2 border rounded-lg text-sm">
          <option value="">All Levels</option>
          {difficulties.map((d) => (
            <option key={d} value={d} className="capitalize">{d}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-3 gap-6">
        {accessories.map((acc) => (
          <div key={acc.id} className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-semibold mb-2">{acc.name}</h3>
            {acc.description && <p className="text-gray-500 text-sm mb-3">{acc.description}</p>}
            <div className="flex gap-2 text-xs">
              {acc.sets_reps && <span className="px-2 py-1 bg-gray-100 rounded">{acc.sets_reps}</span>}
              <span className={`px-2 py-1 rounded capitalize ${
                acc.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                acc.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {acc.difficulty}
              </span>
            </div>
          </div>
        ))}
        {accessories.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-12">No accessories found</p>
        )}
      </div>
    </div>
  )
}
