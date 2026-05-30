import type { Recommendation } from '../types'

const categoryColors: Record<string, string> = {
  volume: 'bg-blue-900/30 text-blue-300 border-blue-700/30',
  recovery: 'bg-green-900/30 text-green-300 border-green-700/30',
  weakness: 'bg-red-900/30 text-red-300 border-red-700/30',
  peaking: 'bg-purple-900/30 text-purple-300 border-purple-700/30',
  general: 'bg-gray-700/30 text-gray-300 border-gray-600/30',
}

const sourceColors: Record<string, string> = {
  rule: 'bg-gold/20 text-gold border-gold/30',
  ai: 'bg-purple-900/30 text-purple-300 border-purple-700/30',
}

interface Props {
  recommendation: Recommendation
  onRead?: () => void
}

export default function RecommendationCard({ recommendation: r, onRead }: Props) {
  return (
    <div
      className={`bg-raised border p-4 cursor-pointer transition-colors hover:bg-hovered ${r.is_read ? 'border-hairline opacity-70' : 'border-gold/20'}`}
      onClick={() => { if (!r.is_read && onRead) onRead() }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex gap-2 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 border ${sourceColors[r.source] || sourceColors.rule}`}>
            {r.source === 'rule' ? 'Rule-based' : 'AI'}
          </span>
          <span className={`text-[10px] px-2 py-0.5 border ${categoryColors[r.category] || categoryColors.general}`}>
            {r.category}
          </span>
        </div>
        <span className="text-[10px] text-muted">{new Date(r.generated_at).toLocaleDateString()}</span>
      </div>
      <h3 className="text-sm font-semibold text-champagne mb-1">{r.title}</h3>
      <p className="text-xs text-muted leading-relaxed whitespace-pre-line">{r.body}</p>
      {!r.is_read && <span className="text-[10px] text-gold mt-2 inline-block">Klik untuk tandai sudah dibaca</span>}
    </div>
  )
}
