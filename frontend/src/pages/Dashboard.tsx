import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import type { ApiResponse, LiftRecord, ChecklistLog } from '../types'

export default function Dashboard() {
  const [recentLifts, setRecentLifts] = useState<LiftRecord[]>([])
  const [checklistSummary, setChecklistSummary] = useState({ done: 0, total: 0 })

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    Promise.all([
      axiosInstance.get<ApiResponse<LiftRecord[]>>('/lifts?limit=5'),
      axiosInstance.get<ApiResponse<ChecklistLog[]>>(`/checklists/log?date=${today}`),
    ])
      .then(([liftsRes, logsRes]) => {
        setRecentLifts(liftsRes.data.data || [])
        const logs = logsRes.data.data || []
        setChecklistSummary({
          done: logs.filter((l: ChecklistLog) => l.is_done).length,
          total: logs.length,
        })
      })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-champagne">Dashboard</h1>
        <p className="text-muted">Welcome back to PowerLog</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/app/lifts" className="bg-raised p-6 border border-hairline hover:bg-hovered transition-colors">
          <h3 className="font-semibold text-champagne mb-1">Total Lifts</h3>
          <p className="text-3xl font-bold text-gold">{recentLifts.length}</p>
          <p className="text-sm text-muted mt-1">This month</p>
        </Link>
        <Link to="/app/lifts" className="bg-raised p-6 border border-hairline hover:bg-hovered transition-colors">
          <h3 className="font-semibold text-champagne mb-1">Checklist</h3>
          <p className="text-3xl font-bold text-patina">{checklistSummary.done}/{checklistSummary.total}</p>
          <p className="text-sm text-muted mt-1">Today</p>
        </Link>
        <Link to="/app/calculator" className="bg-raised p-6 border border-hairline hover:bg-hovered transition-colors">
          <h3 className="font-semibold text-champagne mb-1">1RM Calculator</h3>
          <p className="text-sm text-muted mt-2">Calculate your one-rep max</p>
        </Link>
      </div>

      {recentLifts.length > 0 && (
        <div className="bg-raised border border-hairline p-6">
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

      <div className="space-y-3">
        <h2 className="font-semibold text-champagne">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/calculator" className="px-4 py-2 bg-gold text-lacquer rounded-sm text-sm font-semibold hover:bg-gold-dim">Calculator</Link>
          <Link to="/app/lifts" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Log Lift</Link>
          <Link to="/app/accessories" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Accessories</Link>
          <Link to="/app/checklist" className="px-4 py-2 border border-gold text-gold rounded-sm text-sm font-semibold hover:bg-gold hover:text-lacquer">Checklist</Link>
        </div>
      </div>
    </div>
  )
}
