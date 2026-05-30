import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { getRecoverySummary } from '../api/recoveryApi'
import { getLiftRatio } from '../api/analyticsApi'
import { getDashboardConfig, updateDashboardConfig } from '../api/dashboardConfigApi'
import { dashboardChat } from '../api/chatApi'
import WidgetGoalProgress from '../components/WidgetGoalProgress'
import WidgetRecommendation from '../components/WidgetRecommendation'
import WidgetRecoveryScore from '../components/WidgetRecoveryScore'
import DashboardWidgetToggle from '../components/DashboardWidgetToggle'
import FloatingChat from '../components/FloatingChat'

import type { ApiResponse, LiftRecord, ChecklistLog, RecoverySummary, LiftRatio } from '../types'

export default function Dashboard() {
  const [recentLifts, setRecentLifts] = useState<LiftRecord[]>([])
  const [checklistSummary, setChecklistSummary] = useState({ done: 0, total: 0 })
  const [recoverySummary, setRecoverySummary] = useState<RecoverySummary | null>(null)
  const [liftRatio, setLiftRatio] = useState<LiftRatio | null>(null)
  const [widgets, setWidgets] = useState<Record<string, boolean>>({
    pr_summary: true,
    weekly_volume: true,
    recovery_score: true,
    goal_progress: true,
    recommendation: true,
    wilks_score: false,
    weight_class: false,
    lift_ratio: true,
  })
  const [showWidgetToggle, setShowWidgetToggle] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    Promise.all([
      axiosInstance.get<ApiResponse<LiftRecord[]>>('/lifts?limit=5'),
      axiosInstance.get<ApiResponse<ChecklistLog[]>>(`/checklists/log?date=${today}`),
      getRecoverySummary(1).catch(() => null),
      getLiftRatio().catch(() => null),
      getDashboardConfig().catch(() => null),
    ])
      .then(([liftsRes, logsRes, recRes, ratioRes, dashRes]) => {
        setRecentLifts(liftsRes.data.data || [])
        const logs = logsRes.data.data || []
        setChecklistSummary({
          done: logs.filter((l: ChecklistLog) => l.is_done).length,
          total: logs.length,
        })
        if (recRes) setRecoverySummary(recRes.data.data)
        if (ratioRes) setLiftRatio(ratioRes.data.data)
        if (dashRes && dashRes.data.data?.widgets) {
          setWidgets(dashRes.data.data.widgets)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const handleSaveWidgets = async (newWidgets: Record<string, boolean>) => {
    setWidgets(newWidgets)
    setShowWidgetToggle(false)
    try {
      await updateDashboardConfig(newWidgets)
    } catch {
      // silent
    }
  }

  const w = (key: string) => widgets[key] !== false

  const quickLinks = [
    { to: '/app/calculator', label: 'Calculator', icon: '🧮', color: 'text-gold' },
    { to: '/app/lifts', label: 'Log Lift', icon: '🏋️‍♂️', color: 'text-patina' },
    { to: '/app/goals', label: 'Goals', icon: '🎯', color: 'text-gold' },
    { to: '/app/body-weight', label: 'Weights', icon: '⚖️', color: 'text-champagne' },
    { to: '/app/recovery', label: 'Recovery', icon: '🛌', color: 'text-patina' },
    { to: '/app/analytics', label: 'Analytics', icon: '📈', color: 'text-gold' },
    { to: '/app/recommendations', label: 'Rekom', icon: '💡', color: 'text-champagne' },
    { to: '/app/accessories', label: 'Accessories', icon: '🛠️', color: 'text-patina' },
    { to: '/app/checklist', label: 'Checklist', icon: '✅', color: 'text-gold' },
  ]

  return (
    <div className={`space-y-10 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-champagne">
            Dashboard <span className="text-gold font-normal">Overview</span>
          </h1>
          <p className="text-muted mt-1">Pantau progress dan optimalkan latihanmu hari ini.</p>
        </div>
        <button
          onClick={() => setShowWidgetToggle(true)}
          className="flex items-center gap-2 px-4 py-2 bg-glass border border-glass-border hover:bg-hovered text-sm text-muted hover:text-champagne rounded-full transition-all backdrop-blur-sm"
        >
          <span>⚙️</span> Atur Widget
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up animate-delay-100">
        <Link to="/app/lifts" className="group relative overflow-hidden bg-raised p-6 border border-hairline hover:border-gold/30 rounded-xl transition-all hover:-translate-y-1 shadow-lg shadow-black/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-gold/10 transition-colors" />
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-2">Total Lifts</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gold">{recentLifts.length}</span>
            <span className="text-muted text-xs">Bulan ini</span>
          </div>
          <p className="text-[10px] text-muted/60 mt-4 italic border-t border-hairline pt-2">Kegunaan: rekap volume latihan SBD</p>
        </Link>

        <Link to="/app/lifts" className="group relative overflow-hidden bg-raised p-6 border border-hairline hover:border-patina/30 rounded-xl transition-all hover:-translate-y-1 shadow-lg shadow-black/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-patina/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-patina/10 transition-colors" />
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-2">Daily Checklist</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-patina">{checklistSummary.done}/{checklistSummary.total}</span>
            <span className="text-muted text-xs">Selesai</span>
          </div>
          <p className="text-[10px] text-muted/60 mt-4 italic border-t border-hairline pt-2">Kegunaan: progress warmup & cooldown</p>
        </Link>

        <Link to="/app/calculator" className="group relative overflow-hidden bg-raised p-6 border border-hairline hover:border-gold/30 rounded-xl transition-all hover:-translate-y-1 shadow-lg shadow-black/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-gold/10 transition-colors" />
          <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-2">1RM Calculator</h3>
          <p className="text-2xl font-light text-champagne mt-1">Estimate Max</p>
          <p className="text-[10px] text-muted/60 mt-6 italic border-t border-hairline pt-2">Kegunaan: hitung beban maksimal latihan</p>
        </Link>
      </div>

      <div className="space-y-8 animate-fade-in-up animate-delay-200">
        {recentLifts.length > 0 && (
          <section className="bg-raised/50 backdrop-blur-md border border-hairline rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-hairline bg-hovered/30 flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-champagne">Recent Training</h2>
                <p className="text-[10px] text-muted italic">Menampilkan 5 riwayat SBD terakhir</p>
              </div>
              <Link to="/app/lifts" className="text-xs text-gold hover:underline">Lihat Semua</Link>
            </div>
            <div className="p-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-muted border-b border-hairline/50">
                    <th className="px-4 py-3 font-medium">Latihan</th>
                    <th className="px-4 py-3 font-medium">Beban</th>
                    <th className="px-4 py-3 font-medium text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline/30">
                  {recentLifts.map((lift) => (
                    <tr key={lift.id} className="hover:bg-hovered/20 transition-colors group">
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-champagne capitalize group-hover:text-gold transition-colors">{lift.lift_type}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-body">
                        {lift.weight_kg}kg <span className="text-muted">x {lift.reps}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted text-right">{lift.lifted_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {w('goal_progress') && <WidgetGoalProgress />}
          {w('recommendation') && <WidgetRecommendation />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {w('recovery_score') && recoverySummary && <WidgetRecoveryScore />}
          
          {w('lift_ratio') && liftRatio && (
            <div className="bg-raised border border-hairline rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-danger/5 blur-3xl -mr-10 -mt-10" />
              <div className="mb-6">
                <h2 className="font-semibold text-champagne">Lift Ratios Analysis</h2>
                <p className="text-[10px] text-muted italic">Mendeteksi kelemahan rasio angkatan SBD</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Bench/Squat', val: liftRatio.bench_to_squat_pct, unit: '%' },
                  { label: 'Deadlift/Squat', val: liftRatio.deadlift_to_squat_pct, unit: '%' },
                  { label: 'Focus Area', val: liftRatio.weakness, unit: '', color: 'text-danger' }
                ].map((item) => (
                  <div key={item.label} className="bg-lacquer/50 p-4 border border-hairline rounded-xl text-center">
                    <p className="text-[10px] text-muted uppercase tracking-tighter mb-1">{item.label}</p>
                    <p className={`text-xl font-bold ${item.color || 'text-champagne'}`}>
                      {typeof item.val === 'number' ? item.val.toFixed(0) : item.val}
                      <span className="text-[10px] ml-0.5 font-normal text-muted">{item.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="animate-fade-in-up animate-delay-300">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-6 px-1">Quick Access Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex flex-col items-center justify-center p-4 bg-raised border border-hairline rounded-xl hover:border-gold/40 hover:bg-hovered transition-all group shadow-md"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{link.icon}</span>
              <span className="text-[10px] font-medium text-muted group-hover:text-champagne transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {showWidgetToggle && (
        <DashboardWidgetToggle
          widgets={widgets}
          onSave={handleSaveWidgets}
          onClose={() => setShowWidgetToggle(false)}
        />
      )}

      <FloatingChat
        mode="dashboard"
        onSend={async (msg) => {
          const res = await dashboardChat(msg)
          return res.data.data.reply
        }}
        style={{ right: '20px', bottom: '20px' }}
      />
    </div>
  )
}
