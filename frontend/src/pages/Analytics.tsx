import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getVolumeWeekly, getIntensityDistribution, getLiftRatio, calculateWilks } from '../api/analyticsApi'
import WeeklyVolumeChart from '../components/WeeklyVolumeChart'
import IntensityZoneChart from '../components/IntensityZoneChart'
import LiftRatioCard from '../components/LiftRatioCard'
import type { WeekVolume, IntensityDistribution, LiftRatio, WilksResult } from '../types'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-light text-champagne">Analytics</h1>
        <p className="text-muted text-sm sm:text-base">Volume, intensity, ratios & strength scores</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-hairline pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm rounded-sm ${tab === t ? 'bg-gold text-lacquer' : 'text-muted hover:text-gold'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Volume' && (
        <div className="bg-raised p-4 sm:p-6 border border-hairline space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-champagne">Weekly Volume</h2>
            <select value={volumeWeeks} onChange={(e) => setVolumeWeeks(Number(e.target.value))}
              className="px-3 py-1 bg-lacquer border border-hairline text-body rounded-sm text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none">
              <option value={4}>4 weeks</option>
              <option value={8}>8 weeks</option>
              <option value={12}>12 weeks</option>
            </select>
          </div>
          {loading ? <div className="spinner-weight mx-auto" /> : <WeeklyVolumeChart data={volumeData} />}
        </div>
      )}

      {tab === 'Intensity' && (
        <div className="bg-raised p-4 sm:p-6 border border-hairline space-y-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <h2 className="font-semibold text-champagne">Intensity Distribution</h2>
            <div className="flex gap-2">
              <select value={intensityLift} onChange={(e) => setIntensityLift(e.target.value)}
                className="px-3 py-1 bg-lacquer border border-hairline text-body rounded-sm text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none">
                <option value="squat">Squat</option>
                <option value="bench">Bench</option>
                <option value="deadlift">Deadlift</option>
              </select>
              <select value={intensityWeeks} onChange={(e) => setIntensityWeeks(Number(e.target.value))}
                className="px-3 py-1 bg-lacquer border border-hairline text-body rounded-sm text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none">
                <option value={4}>4 weeks</option>
                <option value={8}>8 weeks</option>
                <option value={12}>12 weeks</option>
              </select>
            </div>
          </div>
          {loading ? <div className="spinner-weight mx-auto" /> : intensityData && <IntensityZoneChart data={intensityData} />}
        </div>
      )}

      {tab === 'Ratios' && (
        <div className="bg-raised p-4 sm:p-6 border border-hairline">
          <h2 className="font-semibold text-champagne mb-4">Lift Ratios & Weakness Detection</h2>
          {loading ? <div className="spinner-weight mx-auto" /> : ratioData ? <LiftRatioCard data={ratioData} /> : (
            <p className="text-muted text-sm text-center py-8">Log some lifts first to see your ratios</p>
          )}
        </div>
      )}

      {tab === 'Wilks/IPF' && (
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onWilksSubmit)} className="bg-raised p-4 sm:p-6 border border-hairline space-y-4">
            <h2 className="font-semibold text-champagne">Calculate Wilks & IPF GL Score</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-champagne mb-1">Body Weight (kg)</label>
                <input type="number" step="0.01" {...register('body_weight_kg')}
                  className="w-full px-3 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                {errors.body_weight_kg && <p className="text-danger text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-champagne mb-1">Total (S+B+D kg)</label>
                <input type="number" step="0.01" {...register('total_kg')}
                  className="w-full px-3 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm" />
                {errors.total_kg && <p className="text-danger text-xs mt-1">Required</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-champagne mb-1">Sex</label>
                <select {...register('sex')}
                  className="w-full px-3 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none text-sm">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <button type="submit"
              className="px-6 py-2 bg-gold text-lacquer rounded-sm font-semibold hover:bg-gold-dim text-sm">
              Calculate
            </button>
          </form>

          {wilksResult && (
            <div className="bg-raised p-4 sm:p-6 border border-hairline space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-lacquer p-4 border border-hairline text-center">
                  <p className="text-xs text-muted">Wilks Score</p>
                  <p className="text-2xl font-bold text-gold">{wilksResult.wilks_score}</p>
                </div>
                <div className="bg-lacquer p-4 border border-hairline text-center">
                  <p className="text-xs text-muted">IPF GL Score</p>
                  <p className="text-2xl font-bold text-gold">{wilksResult.ipf_gl_score}</p>
                </div>
              </div>
              <div className="text-xs text-muted">
                <p className="font-medium text-champagne mb-1">Wilks Level</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Beginner', max: 300, color: 'text-muted' },
                    { label: 'Intermediate', max: 400, color: 'text-patina' },
                    { label: 'Advanced', max: 500, color: 'text-gold' },
                    { label: 'Elite', max: Infinity, color: 'text-danger' },
                  ].map((l) => (
                    <div key={l.label} className={`p-2 border border-hairline ${wilksResult.wilks_score < l.max ? l.color + ' bg-lacquer' : 'bg-hovered ' + l.color}`}>
                      <p className="font-bold">{l.label}</p>
                      <p className="opacity-70">{l.max === Infinity ? '500+' : `<${l.max}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
