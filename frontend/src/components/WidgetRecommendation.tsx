import { useState, useEffect } from 'react'
import { getRecommendations } from '../api/recommendationApi'
import type { Recommendation } from '../types'
import RecommendationCard from './RecommendationCard'

export default function WidgetRecommendation() {
  const [recs, setRecs] = useState<Recommendation[]>([])

  useEffect(() => {
    getRecommendations(undefined, 3)
      .then((res) => setRecs(res.data.data || []))
      .catch(() => {})
  }, [])

  if (recs.length === 0) return null

  return (
    <div className="bg-raised p-4 sm:p-6 border border-hairline">
      <h2 className="font-semibold text-champagne mb-3">Rekomendasi</h2>
      <div className="space-y-3">
        {recs.map((r) => (
          <RecommendationCard key={r.id} recommendation={r} />
        ))}
      </div>
    </div>
  )
}
