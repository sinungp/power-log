import type { RecoverySummary } from '../types'

interface Props {
  data: RecoverySummary
}

export default function RecoverySummaryCard({ data }: Props) {
  const trendColor = data.trend === 'improving' ? 'text-patina' : data.trend === 'declining' ? 'text-danger' : 'text-gold'
  const trendIcon = data.trend === 'improving' ? '↑' : data.trend === 'declining' ? '↓' : '→'

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-4xl font-bold text-gold">{data.recovery_score}</p>
        <p className="text-xs text-muted mt-1">Recovery Score</p>
        <span className={`inline-flex items-center gap-1 text-xs font-medium capitalize mt-1 ${trendColor}`}>
          {trendIcon} {data.trend}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-lacquer p-2 border border-hairline">
          <span className="text-muted">Sleep</span>
          <p className="text-champagne font-bold">{data.avg_sleep_hours}h / {data.avg_sleep_quality}/10</p>
        </div>
        <div className="bg-lacquer p-2 border border-hairline">
          <span className="text-muted">Stress</span>
          <p className="text-champagne font-bold">{data.avg_stress_level}/10</p>
        </div>
        <div className="bg-lacquer p-2 border border-hairline">
          <span className="text-muted">DOMS</span>
          <p className="text-champagne font-bold">{data.avg_doms_level}/5</p>
        </div>
      </div>
    </div>
  )
}
