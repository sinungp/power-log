import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { BodyWeightLog } from '../types'

interface Props {
  data: BodyWeightLog[]
  recommendedClass?: string
}

export default function BodyWeightChart({ data, recommendedClass }: Props) {
  if (!data.length) {
    return <div className="text-muted text-sm py-8 text-center">No weight data yet</div>
  }

  const chartData = [...data].reverse().map((d) => ({
    date: d.logged_at.slice(5),
    weight: d.weight_kg,
  }))

  return (
    <div className="space-y-3">
      {recommendedClass && (
        <p className="text-xs text-muted">
          Recommended class: <span className="text-gold font-semibold">{recommendedClass} kg</span>
        </p>
      )}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(20% 0.005 95)" />
            <XAxis dataKey="date" stroke="oklch(45% 0.005 95)" fontSize={11} />
            <YAxis stroke="oklch(45% 0.005 95)" fontSize={11} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                background: 'oklch(11% 0.005 95)',
                border: '1px solid oklch(20% 0.005 95)',
                borderRadius: 0,
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="weight" stroke="oklch(84% 0.19 80.46)" strokeWidth={2} dot={{ fill: 'oklch(84% 0.19 80.46)', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
