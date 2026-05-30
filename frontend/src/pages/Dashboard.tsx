import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import { getRecoverySummary } from '../api/recoveryApi'
import { getLiftRatio } from '../api/analyticsApi'
import { getDashboardConfig, updateDashboardConfig } from '../api/dashboardConfigApi'
import WidgetGoalProgress from '../components/WidgetGoalProgress'
import WidgetRecommendation from '../components/WidgetRecommendation'
import WidgetRecoveryScore from '../components/WidgetRecoveryScore'
import DashboardWidgetToggle from '../components/DashboardWidgetToggle'

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
      })
      .catch(() => {})
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-light text-champagne">Dashboard</h1>
          <p className="text-muted text-sm sm:text-base">Welcome back to PowerLog</p>
        </div>
        <button
          onClick={() => setShowWidgetToggle(true)}
          className="text-xs px-3 py-1.5 border border-hairline text-muted hover:text-champagne"
        >
          Atur Widget
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/app/lifts" className="bg-raised p-4 sm:p-6 border border-hairline hover:bg-hovered transition-colors">
          <h3 className="font-semibold text-champagne mb-1">Total Lifts</h3>
          <p className="text-2xl sm:text-3xl font-bold text-gold">{recentLifts.length}</p>
          <p className="text-sm text-muted mt-1">Month</p>
        </Link>
        <Link to="/app/lifts" className="bg-raised p-4 sm:p-6 border border-hairline hover:bg-hovered transition-colors">
          <h3 className="font-semibold text-champagne mb-1">Checklist</h3>
          <p className="text-2xl sm:text-3xl font-bold text-patina">{checklistSummary.done}/{checklistSummary.total}</p>
          <p className="text-sm text-muted mt-1">Today</p>
        </Link>
        <Link to="/app/calculator" className="bg-raised p-4 sm:p-6 border border-hairline hover:bg-hovered transition-colors">
          <h3 className="font-semibold text-champagne mb-1">1RM Calculator</h3>
          <p className="text-sm text-muted mt-2">Calculate your one-rep max</p>
        </Link>
      </div>

      {recentLifts.length > 0 && (
        <div className="bg-raised border border-hairline p-4 sm:p-6">
          <h2 className="font-semibold text-champagne mb-4">Recent Lifts</h2>
          <div className="space-y-3">
            {recentLifts.map((lift) => (
              <div key={lift.id} className="flex justify-between items-center border-b border-hairline pb-2 last:border-0">
                <div>
                  <span className="font-medium text-champagne capitalize">{lift.lift_type}</span>
                  <span className="text-muted ml-2">{lift.weight_kg}kg x {lift.reps}</span>
                </div>
                <span className="text-sm text-muted">{lift.lifted_at}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {w('goal_progress') && <WidgetGoalProgress />}

      {w('recommendation') && <WidgetRecommendation />}

      <div className="grid md:grid-cols-2 gap-4">
        {w('recovery_score') && recoverySummary && (
          <WidgetRecoveryScore />
        )}
        {w('lift_ratio') && liftRatio && (
          <div className="bg-raised p-4 sm:p-6 border border-hairline">
            <h2 className="font-semibold text-champagne mb-3">Lift Ratios</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-lacquer p-2 border border-hairline">
                <p className="text-[10px] text-muted">B/S</p>
                <p className="text-sm font-bold text-champagne">{liftRatio.bench_to_squat_pct.toFixed(0)}%</p>
              </div>
              <div className="bg-lacquer p-2 border border-hairline">
                <p className="text-[10px] text-muted">D/S</p>
                <p className="text-sm font-bold text-champagne">{liftRatio.deadlift_to_squat_pct.toFixed(0)}%</p>
              </div>
              <div className="bg-lacquer p-2 border border-hairline">
                <p className="text-[10px] text-muted">Weakness</p>
                <p className="text-sm font-bold capitalize text-danger">{liftRatio.weakness}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-champagne">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/calculator" className="px-4 py-2 bg-gold text-lacquer rounded-sm text-sm font-semibold hover:bg-gold-dim">Calculator</Link>
          <Link to="/app/lifts" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Log Lift</Link>
          <Link to="/app/goals" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Goals</Link>
          <Link to="/app/body-weight" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Weights</Link>
          <Link to="/app/recovery" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Recovery</Link>
          <Link to="/app/analytics" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Analytics</Link>
          <Link to="/app/recommendations" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Rekom</Link>
          <Link to="/app/accessories" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Accessories</Link>
          <Link to="/app/checklist" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Checklist</Link>
        </div>
      </div>

      {showWidgetToggle && (
        <DashboardWidgetToggle
          widgets={widgets}
          onSave={handleSaveWidgets}
          onClose={() => setShowWidgetToggle(false)}
        />
      )}
    </div>
  )
}
