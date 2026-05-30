import type { GoalProgress as GoalProgressType } from '../types'

const goalLabels: Record<string, string> = {
  squat_1rm: 'Squat 1RM',
  bench_1rm: 'Bench 1RM',
  deadlift_1rm: 'Deadlift 1RM',
  body_weight: 'Berat Badan',
  competition: 'Kompetisi',
}

interface Props {
  goal: GoalProgressType
  onEdit?: () => void
  onDelete?: () => void
  onAchieve?: () => void
}

export default function GoalProgressCard({ goal, onEdit, onDelete, onAchieve }: Props) {
  const label = goalLabels[goal.goal_type] || goal.goal_type
  const pct = Math.min(goal.progress_pct, 100)

  return (
    <div className="bg-raised border border-hairline p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-champagne">{label}</h3>
          <p className="text-xs text-muted">
            {goal.is_achieved ? 'Tercapai! 🎉' : `Target: ${goal.target_value} ${goal.goal_type === 'body_weight' ? 'kg' : 'kg'}`}
          </p>
        </div>
        {goal.is_achieved && (
          <span className="text-xs px-2 py-0.5 bg-patina/20 text-patina border border-patina/30">
            Tercapai
          </span>
        )}
      </div>

      <div className="w-full bg-lacquer h-2 border border-hairline mb-2">
        <div
          className={`h-full transition-all ${goal.is_achieved ? 'bg-patina' : 'bg-gold'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted mb-3">
        <span>{goal.goal_type !== 'competition' ? `${goal.current_value?.toFixed(1) || 0} kg` : '-'}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>

      {goal.estimated_date && !goal.is_achieved && (
        <p className="text-xs text-muted">
          Estimasi tercapai: {goal.estimated_date}
        </p>
      )}

      {goal.days_remaining > 0 && goal.target_date && (
        <p className="text-xs text-muted">
          {goal.goal_type === 'competition' ? `H-${goal.days_remaining}` : `${goal.days_remaining} hari lagi`}
        </p>
      )}

      {!goal.is_achieved && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-hairline">
          {onAchieve && (
            <button onClick={onAchieve} className="text-xs px-3 py-1 bg-patina text-lacquer font-semibold hover:bg-patina/80">
              Tandai Tercapai
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit} className="text-xs px-3 py-1 border border-hairline text-muted hover:text-champagne">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-xs px-3 py-1 border border-hairline text-danger hover:bg-danger/10">
              Hapus
            </button>
          )}
        </div>
      )}
    </div>
  )
}
