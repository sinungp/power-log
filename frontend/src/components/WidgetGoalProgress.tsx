import { useState, useEffect } from 'react'
import { getGoalProgress } from '../api/goalApi'
import type { GoalProgress } from '../types'
import GoalProgressCard from './GoalProgressCard'

export default function WidgetGoalProgress() {
  const [goals, setGoals] = useState<GoalProgress[]>([])

  useEffect(() => {
    getGoalProgress()
      .then((res) => setGoals(res.data.data || []))
      .catch(() => {})
  }, [])

  if (goals.length === 0) return null

  return (
    <div className="bg-raised p-4 sm:p-6 border border-hairline">
      <h2 className="font-semibold text-champagne mb-3">Progress Goal</h2>
      <div className="space-y-3">
        {goals.slice(0, 3).map((g) => (
          <GoalProgressCard key={g.id} goal={g} />
        ))}
      </div>
    </div>
  )
}
