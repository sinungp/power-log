import { useState, useEffect } from 'react'
import { getRecommendations, generateRecommendations, requestAIAnalysis, markRecommendationRead } from '../api/recommendationApi'
import type { Recommendation } from '../types'
import RecommendationCard from '../components/RecommendationCard'

export default function Recommendations() {
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiCooldown, setAiCooldown] = useState(0)

  const fetchRecs = () => {
    getRecommendations(undefined, 20)
      .then((res) => setRecs(res.data.data || []))
      .catch(() => {})
  }

  useEffect(() => { fetchRecs() }, [])

  useEffect(() => {
    if (aiCooldown <= 0) return
    const t = setInterval(() => setAiCooldown((c) => c - 1), 3600000)
    return () => clearInterval(t)
  }, [aiCooldown])

  const handleGenerate = async () => {
    setLoading(true)
    await generateRecommendations()
    setLoading(false)
    fetchRecs()
  }

  const handleAIAnalysis = async () => {
    if (aiCooldown > 0 || aiLoading) return
    setAiLoading(true)
    try {
      await requestAIAnalysis(4)
      setAiCooldown(24)
      fetchRecs()
    } catch {
      // ignore
    }
    setAiLoading(false)
  }

  const handleRead = async (id: number) => {
    await markRecommendationRead(id)
    fetchRecs()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-light text-champagne">Rekomendasi</h1>
        <p className="text-muted text-sm">Saran latihan berdasarkan data kamu</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-gold text-lacquer font-semibold text-sm hover:bg-gold-dim disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Generate Rekomendasi'}
        </button>
        <button
          onClick={handleAIAnalysis}
          disabled={aiLoading || aiCooldown > 0}
          className="px-4 py-2 border border-purple-600 text-purple-300 font-semibold text-sm hover:bg-purple-900/20 disabled:opacity-50"
        >
          {aiLoading ? 'Menganalisis...' : aiCooldown > 0 ? `AI tersedia dalam ${aiCooldown} jam` : 'Minta Analisis AI'}
        </button>
      </div>

      {recs.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">Belum ada rekomendasi. Klik "Generate Rekomendasi" untuk memulai.</p>
      ) : (
        <div className="space-y-4">
          {recs.map((r) => (
            <RecommendationCard
              key={r.id}
              recommendation={r}
              onRead={() => !r.is_read && handleRead(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
