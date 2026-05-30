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
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back to PowerLog</p>
      </div>

      <div className="grid md:grid-3 gap-6">
        <Link to="/app/lifts" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold mb-1">Total Lifts</h3>
          <p className="text-3xl font-bold text-blue-600">{recentLifts.length}</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </Link>
        <Link to="/app/lifts" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold mb-1">Checklist</h3>
          <p className="text-3xl font-bold text-green-600">{checklistSummary.done}/{checklistSummary.total}</p>
          <p className="text-sm text-gray-500 mt-1">Today</p>
        </Link>
        <Link to="/app/calculator" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold mb-1">1RM Calculator</h3>
          <p className="text-sm text-gray-500 mt-2">Calculate your one-rep max</p>
        </Link>
      </div>

      {recentLifts.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="font-semibold mb-4">Recent Lifts</h2>
          <div className="space-y-3">
            {recentLifts.map((lift) => (
              <div key={lift.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                <div>
                  <span className="font-medium capitalize">{lift.lift_type}</span>
                  <span className="text-gray-500 ml-2">{lift.weight_kg}kg × {lift.reps}</span>
                </div>
                <span className="text-sm text-gray-400">{lift.lifted_at}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        <h2 className="font-semibold">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/calculator" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Calculator</Link>
          <Link to="/app/lifts" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">Log Lift</Link>
          <Link to="/app/accessories" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Accessories</Link>
          <Link to="/app/checklist" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">Checklist</Link>
        </div>
      </div>
    </div>
  )
}
