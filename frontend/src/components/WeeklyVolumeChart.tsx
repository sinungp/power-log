import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { WeekVolume } from '../types'

interface Props {
  data: WeekVolume[]
}

export default function WeeklyVolumeChart({ data }: Props) {
  if (!data.length) {
    return <div className="text-muted text-sm py-8 text-center">No volume data yet</div>
  }

  const chartData = data.map((w) => ({
    week: w.week_start.slice(5),
    Squat: Math.round(w.squat_volume_kg),
    Bench: Math.round(w.bench_volume_kg),
    Deadlift: Math.round(w.deadlift_volume_kg),
  }))

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(20% 0.005 95)" />
          <XAxis dataKey="week" stroke="oklch(45% 0.005 95)" fontSize={12} />
          <YAxis stroke="oklch(45% 0.005 95)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: 'oklch(11% 0.005 95)',
              border: '1px solid oklch(20% 0.005 95)',
              borderRadius: 0,
              fontSize: 12,
            }}
            itemStyle={{ color: 'oklch(88% 0 0)' }}
          />
          <Legend fontSize={12} />
          <Bar dataKey="Squat" fill="oklch(70% 0.12 188)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Bench" fill="oklch(84% 0.19 80.46)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Deadlift" fill="oklch(55% 0.2 22)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
