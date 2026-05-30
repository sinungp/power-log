import type { LiftRatio } from '../types'

interface Props {
  data: LiftRatio
}

export default function LiftRatioCard({ data }: Props) {
  const gauge = (label: string, value: number, min: number, max: number, unit: string) => {
    const clamped = Math.min(Math.max(value, min), max)
    const pct = ((clamped - min) / (max - min)) * 100
    const inRange = value >= min && value <= max
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted">{label}</span>
          <span className="text-body font-medium">{value.toFixed(1)}{unit}</span>
        </div>
        <div className="h-2 bg-lacquer border border-hairline">
          <div
            className={`h-full ${inRange ? 'bg-patina' : 'bg-danger'}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
    )
  }

  const weaknessColor =
    data.weakness === 'balanced' ? 'text-patina' :
    data.weakness === 'bench' ? 'text-danger' :
    data.weakness === 'deadlift' ? 'text-danger' :
    'text-gold'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-lacquer p-3 border border-hairline text-center">
          <span className="text-xs text-muted">Squat 1RM</span>
          <p className="text-lg font-bold text-champagne">{data.squat_1rm.toFixed(1)}</p>
        </div>
        <div className="bg-lacquer p-3 border border-hairline text-center">
          <span className="text-xs text-muted">Bench 1RM</span>
          <p className="text-lg font-bold text-champagne">{data.bench_1rm.toFixed(1)}</p>
        </div>
        <div className="bg-lacquer p-3 border border-hairline text-center">
          <span className="text-xs text-muted">Deadlift 1RM</span>
          <p className="text-lg font-bold text-champagne">{data.deadlift_1rm.toFixed(1)}</p>
        </div>
      </div>

      {gauge('Bench / Squat', data.bench_to_squat_pct, 67, 75, '%')}
      {gauge('Deadlift / Squat', data.deadlift_to_squat_pct, 115, 125, '%')}

      <div className={`p-3 border text-sm ${weaknessColor === 'text-patina' ? 'bg-patina/10 border-patina/30' : 'bg-danger/10 border-danger/30'}`}>
        <span className={`font-semibold capitalize ${weaknessColor}`}>
          {data.weakness === 'balanced' ? 'Balanced' : `Weakness: ${data.weakness}`}
        </span>
        <p className="text-body mt-1 text-xs">{data.weakness_note}</p>
      </div>

      <div>
        <p className="text-xs text-muted mb-2">Strength to Body Weight</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-lacquer p-2 border border-hairline text-center">
            <span className="text-muted">S/BW</span>
            <p className="text-gold font-bold">{data.squat_to_bodyweight.toFixed(1)}x</p>
          </div>
          <div className="bg-lacquer p-2 border border-hairline text-center">
            <span className="text-muted">B/BW</span>
            <p className="text-gold font-bold">{data.bench_to_bodyweight.toFixed(1)}x</p>
          </div>
          <div className="bg-lacquer p-2 border border-hairline text-center">
            <span className="text-muted">D/BW</span>
            <p className="text-gold font-bold">{data.deadlift_to_bodyweight.toFixed(1)}x</p>
          </div>
        </div>
      </div>
    </div>
  )
}
