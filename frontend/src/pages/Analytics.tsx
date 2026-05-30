import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getVolumeWeekly, getIntensityDistribution, getLiftRatio, calculateWilks } from '../api/analyticsApi'
import WeeklyVolumeChart from '../components/WeeklyVolumeChart'
import IntensityZoneChart from '../components/IntensityZoneChart'
import LiftRatioCard from '../components/LiftRatioCard'
import type { WeekVolume, IntensityDistribution, LiftRatio, WilksResult } from '../types'
import FloatingChat from '../components/FloatingChat'
import { dashboardChat } from '../api/chatApi'

const tabs = ['Volume', 'Intensity', 'Ratios', 'Wilks/IPF'] as const

const wilksSchema = z.object({
  body_weight_kg: z.coerce.number().positive(),
  total_kg: z.coerce.number().positive(),
  sex: z.enum(['male', 'female']),
})

export default function AnalyticsPage() {
  const [tab, setTab] = useState<string>('Volume')
  const [loading, setLoading] = useState(true)

  const [volumeData, setVolumeData] = useState<WeekVolume[]>([])
  const [volumeWeeks, setVolumeWeeks] = useState(4)
  const [intensityData, setIntensityData] = useState<IntensityDistribution | null>(null)
  const [intensityLift, setIntensityLift] = useState('squat')
  const [intensityWeeks, setIntensityWeeks] = useState(4)
  const [ratioData, setRatioData] = useState<LiftRatio | null>(null)
  const [wilksResult, setWilksResult] = useState<WilksResult | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(wilksSchema),
    defaultValues: { sex: 'male' },
  })

  useEffect(() => {
    setLoading(true)
    switch (tab) {
      case 'Volume':
        getVolumeWeekly(volumeWeeks).then((r) => setVolumeData(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
        break
      case 'Intensity':
        getIntensityDistribution(intensityLift, intensityWeeks).then((r) => setIntensityData(r.data.data)).catch(() => {}).finally(() => setLoading(false))
        break
      case 'Ratios':
        getLiftRatio().then((r) => setRatioData(r.data.data)).catch(() => {}).finally(() => setLoading(false))
        break
      default:
        setLoading(false)
    }
  }, [tab, volumeWeeks, intensityLift, intensityWeeks])

  const onWilksSubmit = async (data: any) => {
    try {
      const res = await calculateWilks(data)
      setWilksResult(res.data.data)
    } catch { /* ignore */ }
  }

  return (
    <>
      <div className="space-y-8">
        <header className="flex items-center gap-4 pb-2 border-b border-hairline">
          <h1 className="text-2xl font-bold text-champagne">Analytics</h1>
        </header>
      </div>
      <FloatingChat
        mode="dashboard"
        onSend={async (msg: string) => {
          const res = await dashboardChat(msg)
          return res.data.data.reply
        }}
      />
      <div className="flex flex-wrap gap-1 bg-raised/30 p-1 border border-hairline rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${tab === t ? 'bg-gold text-lacquer shadow-lg shadow-gold/20' : 'text-muted hover:text-champagne hover:bg-hovered/50'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Volume' && (
        <div className="bg-raised/50 backdrop-blur-md p-6 sm:p-8 border border-hairline rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-16 -mt-16" />
          <div className="flex justify-between items-center relative z-10">
            <h2 className="text-lg font-semibold text-champagne">Weekly Volume</h2>
            <select value={volumeWeeks} onChange={(e) => setVolumeWeeks(Number(e.target.value))}
              className="px-4 py-1.5 bg-lacquer border border-hairline text-muted rounded-full text-xs focus:border-gold outline-none">
              <option value={4}>Last 4 weeks</option>
              <option value={8}>Last 8 weeks</option>
              <option value={12}>Last 12 weeks</option>
            </select>
          </div>
          <div className="relative z-10">
            {loading ? <div className="flex justify-center py-20"><div className="spinner-weight" /></div> : <WeeklyVolumeChart data={volumeData} />}
          </div>
        </div>
      )}

      {tab === 'Intensity' && (
        <div className="bg-raised/50 backdrop-blur-md p-6 sm:p-8 border border-hairline rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-patina/5 blur-3xl -mr-16 -mt-16" />
          <div className="flex flex-wrap gap-4 justify-between relative z-10">
            <h2 className="text-lg font-semibold text-champagne">Intensity Distribution</h2>
            <div className="flex gap-2">
              <select value={intensityLift} onChange={(e) => setIntensityLift(e.target.value)}
                className="px-4 py-1.5 bg-lacquer border border-hairline text-muted rounded-full text-xs focus:border-gold outline-none">
                <option value="squat">Squat</option>
                <option value="bench">Bench</option>
                <option value="deadlift">Deadlift</option>
              </select>
              <select value={intensityWeeks} onChange={(e) => setIntensityWeeks(Number(e.target.value))}
                className="px-4 py-1.5 bg-lacquer border border-hairline text-muted rounded-full text-xs focus:border-gold outline-none">
                <option value={4}>4 weeks</option>
                <option value={8}>8 weeks</option>
                <option value={12}>12 weeks</option>
              </select>
            </div>
          </div>
          <div className="relative z-10">
            {loading ? <div className="flex justify-center py-20"><div className="spinner-weight" /></div> : intensityData && <IntensityZoneChart data={intensityData} />}
          </div>
        </div>
      )}

      {tab === 'Ratios' && (
        <div className="bg-raised/50 backdrop-blur-md p-6 sm:p-8 border border-hairline rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 blur-3xl -mr-16 -mt-16" />
          <h2 className="text-lg font-semibold text-champagne mb-6 relative z-10">Lift Ratios & Weakness Detection</h2>
          <div className="relative z-10">
            {loading ? <div className="flex justify-center py-10"><div className="spinner-weight" /></div> : ratioData ? <LiftRatioCard data={ratioData} /> : (
              <p className="text-muted text-sm text-center py-12">Log some lifts first to see your ratios</p>
            )}
          </div>
        </div>
      )}

      {tab === 'Wilks/IPF' && (
        <div className="space-y-8 w-full">
          <form onSubmit={handleSubmit(onWilksSubmit)} className="bg-raised/50 backdrop-blur-md p-6 sm:p-8 border border-hairline rounded-2xl shadow-xl space-y-6">
            <h2 className="text-lg font-semibold text-champagne">Calculator <span className="text-gold">Strength Scores</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Body Weight (kg)</label>
                <input type="number" step="0.01" {...register('body_weight_kg')}
                  className="w-full px-4 py-3 bg-lacquer border border-hairline text-body rounded-xl focus:border-gold outline-none text-sm transition-all" />
                {errors.body_weight_kg && <p className="text-danger text-[10px] mt-1 uppercase">Required</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Total SBD (kg)</label>
                <input type="number" step="0.01" {...register('total_kg')}
                  className="w-full px-4 py-3 bg-lacquer border border-hairline text-body rounded-xl focus:border-gold outline-none text-sm transition-all" />
                {errors.total_kg && <p className="text-danger text-[10px] mt-1 uppercase">Required</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Biological Sex</label>
                <select {...register('sex')}
                  className="w-full px-4 py-3 bg-lacquer border border-hairline text-body rounded-xl focus:border-gold outline-none text-sm transition-all">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <button type="submit"
              className="w-full sm:w-auto px-10 py-3 bg-gold text-lacquer rounded-xl font-bold shadow-lg shadow-gold/20 hover:bg-gold-dim transition-all text-sm uppercase tracking-widest">
              Calculate Scores
            </button>
          </form>

          {wilksResult && (
            <div className="bg-raised/50 backdrop-blur-md p-6 sm:p-8 border border-hairline rounded-2xl shadow-xl space-y-8 animate-fade-in-scale">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-lacquer/50 p-6 border border-hairline rounded-2xl text-center group hover:border-gold/30 transition-all">
                  <p className="text-xs text-muted uppercase tracking-widest mb-1">Wilks Score</p>
                  <p className="text-4xl font-bold text-gold group-hover:scale-105 transition-transform">{wilksResult.wilks_score}</p>
                </div>
                <div className="bg-lacquer/50 p-6 border border-hairline rounded-2xl text-center group hover:border-gold/30 transition-all">
                  <p className="text-xs text-muted uppercase tracking-widest mb-1">IPF GL Score</p>
                  <p className="text-4xl font-bold text-gold group-hover:scale-105 transition-transform">{wilksResult.ipf_gl_score}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Strength Classification</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Beginner', max: 300, color: 'text-muted' },
                    { label: 'Intermediate', max: 400, color: 'text-patina' },
                    { label: 'Advanced', max: 500, color: 'text-gold' },
                    { label: 'Elite', max: Infinity, color: 'text-danger' },
                  ].map((l) => (
                    <div key={l.label} className={`p-4 border rounded-xl transition-all ${wilksResult.wilks_score < l.max ? 'border-hairline bg-lacquer/30 ' + l.color : 'border-current bg-hovered/40 ' + l.color}`}>
                      <p className="font-bold text-sm">{l.label}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">{l.max === Infinity ? '500+' : `< ${l.max}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
