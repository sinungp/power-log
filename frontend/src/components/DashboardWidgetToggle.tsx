import { useState } from 'react'

const allWidgets = [
  { key: 'pr_summary', label: 'PR Summary' },
  { key: 'weekly_volume', label: 'Volume Mingguan' },
  { key: 'recovery_score', label: 'Recovery Score' },
  { key: 'goal_progress', label: 'Progress Goal' },
  { key: 'recommendation', label: 'Rekomendasi' },
  { key: 'wilks_score', label: 'Wilks Score' },
  { key: 'weight_class', label: 'Weight Class' },
  { key: 'lift_ratio', label: 'Lift Ratio' },
]

interface Props {
  widgets: Record<string, boolean>
  onSave: (widgets: Record<string, boolean>) => void
  onClose: () => void
}

export default function DashboardWidgetToggle({ widgets, onSave, onClose }: Props) {
  const [local, setLocal] = useState<Record<string, boolean>>({ ...widgets })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-raised border border-hairline w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-champagne">Atur Widget</h2>
          <button onClick={onClose} className="text-muted hover:text-champagne">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {allWidgets.map((w) => (
            <label key={w.key} className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
              <span className="text-sm text-champagne">{w.label}</span>
              <button
                onClick={() => setLocal({ ...local, [w.key]: !local[w.key] })}
                className={`w-10 h-5 rounded-full transition-colors relative ${local[w.key] ? 'bg-gold' : 'bg-hairline'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-lacquer transition-transform ${local[w.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(local)}
            className="flex-1 py-2 bg-gold text-lacquer font-semibold text-sm hover:bg-gold-dim"
          >
            Simpan
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-hairline text-muted text-sm hover:text-champagne">
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
