import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { IntensityDistribution } from '../types'

interface Props {
  data: IntensityDistribution
}

const zones = [
  { key: 'zone_1_recovery', label: 'Z1 Recovery (<70%)', color: 'oklch(70% 0.12 188)' },
  { key: 'zone_2_hypertrophy', label: 'Z2 Hypertrophy (70-80%)', color: 'oklch(84% 0.19 80.46)' },
  { key: 'zone_3_strength', label: 'Z3 Strength (80-90%)', color: 'oklch(60% 0.18 50)' },
  { key: 'zone_4_peaking', label: 'Z4 Peaking (>90%)', color: 'oklch(55% 0.2 22)' },
]

export default function IntensityZoneChart({ data }: Props) {
  if (!data.total_sessions) {
    return <div className="text-muted text-sm py-8 text-center">No intensity data yet</div>
  }

  const chartData = zones.map((z) => ({
    name: z.label,
    value: data[z.key as keyof IntensityDistribution] as number,
    color: z.color,
  })).filter((d) => d.value > 0)

  return (
    <div className="h-64 flex items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'oklch(11% 0.005 95)',
              border: '1px solid oklch(20% 0.005 95)',
              borderRadius: 0,
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 text-xs">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="w-3 h-3" style={{ background: d.color }} />
            <span className="text-muted">{d.name}</span>
            <span className="text-body font-medium">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
