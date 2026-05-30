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
      <h1 className="text-xl sm:text-2xl font-light text-champagne">Exercise Accessories</h1>

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {targets.map((t) => (
            <button key={t} onClick={() => setTarget(t)} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-sm capitalize ${target === t ? 'bg-gold text-lacquer' : 'border border-hairline text-muted hover:bg-hovered hover:text-champagne'}`}>
              {t}
            </button>
          ))}
        </div>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm">
          <option value="">All Levels</option>
          {difficulties.map((d) => (
            <option key={d} value={d} className="capitalize">{d}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {accessories.map((acc) => (
          <div key={acc.id} className="bg-raised p-4 sm:p-6 border border-hairline">
            <h3 className="font-semibold text-champagne mb-2">{acc.name}</h3>
            {acc.description && <p className="text-muted text-sm mb-3 leading-relaxed">{acc.description}</p>}
            <div className="flex gap-2 text-xs">
              {acc.sets_reps && <span className="px-2 py-1 bg-lacquer border border-hairline text-body">{acc.sets_reps}</span>}
              <span className={`px-2 py-1 capitalize ${
                acc.difficulty === 'beginner' ? 'bg-patina/10 text-patina border border-patina/30' :
                acc.difficulty === 'intermediate' ? 'bg-gold/10 text-gold border border-gold/30' :
                'bg-danger/10 text-danger border border-danger/30'
              }`}>
                {acc.difficulty}
              </span>
            </div>
          </div>
        ))}
        {accessories.length === 0 && (
          <p className="col-span-full text-center text-muted py-12">No accessories found</p>
        )}
      </div>
    </div>
  )
}
