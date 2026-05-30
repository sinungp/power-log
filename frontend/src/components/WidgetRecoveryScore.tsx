import { useState, useEffect } from 'react'
import { getRecoverySummary } from '../api/recoveryApi'
import type { RecoverySummary } from '../types'
import RecoverySummaryCard from './RecoverySummaryCard'

export default function WidgetRecoveryScore() {
  const [data, setData] = useState<RecoverySummary | null>(null)

  useEffect(() => {
    getRecoverySummary(1)
      .then((res) => setData(res.data.data))
      .catch(() => {})
  }, [])

  if (!data) return null

  return (
    <div className="bg-raised p-4 sm:p-6 border border-hairline">
      <h2 className="font-semibold text-champagne">Recovery (7 hari)</h2>
      <p className="text-xs text-muted mb-3">Kegunaan: memantau skor pemulihan dari sleep, stress, dan DOMS untuk hindari overtraining</p>
      <RecoverySummaryCard data={data} />
    </div>
  )
}
