import { useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'
import type { ApiResponse, Accessory } from '../types'
import FloatingChat from '../components/FloatingChat'
import { dashboardChat } from '../api/chatApi'

const targets = ['squat', 'bench', 'deadlift', 'general'] as const
const difficulties = ['beginner', 'intermediate', 'advanced'] as const

export default function AccessoryPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [target, setTarget] = useState<string>('squat')
  const [difficulty, setDifficulty] = useState<string>('')

  useEffect(() => {
    const params = new URLSearchParams({ target })
    if (difficulty) params.set('difficulty', difficulty)
    axiosInstance.get<ApiResponse<Accessory[]>>(`/accessories?${params}`)
      .then((res) => setAccessories(res.data.data || []))
      .catch(() => {})
  }, [target, difficulty])

  return (
    <div className="min-h-screen bg-lacquer animate-fade-in-up">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 lg:px-8 py-8 bg-raised/50 backdrop-blur-sm border-b border-hairline/30 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-champagne">
            Exercise <span className="text-gold font-normal">Accessories</span>
          </h1>
          <p className="text-muted mt-1">Discover exercises to supplement your main SBD lifts.</p>
        </div>
      </header>

      <main className="p-6 sm:p-8 space-y-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex flex-wrap gap-2 p-1 bg-raised/30 border border-hairline rounded-xl shadow-inner">
            {targets.map((t) => (
              <button key={t} onClick={() => setTarget(t)} 
                className={`px-6 py-2.5 text-xs font-bold rounded-lg transition-all capitalize ${target === t ? 'bg-gold text-lacquer shadow-lg shadow-gold/20' : 'text-muted hover:text-champagne hover:bg-hovered/50'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="relative group">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} 
              className="px-6 py-3 bg-lacquer border border-hairline text-champagne rounded-xl focus:border-gold outline-none text-sm appearance-none min-w-[200px] transition-all cursor-pointer">
              <option value="">All Difficulty Levels</option>
              {difficulties.map((d) => (
                <option key={d} value={d} className="capitalize">{d}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">▼</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessories.map((acc) => (
            <div key={acc.id} className="bg-raised/50 p-6 sm:p-8 border border-hairline rounded-2xl shadow-xl hover:border-gold/30 hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-3xl -mr-12 -mt-12 group-hover:bg-gold/10 transition-colors" />
              <h3 className="text-lg font-bold text-champagne mb-3 group-hover:text-gold transition-colors">{acc.name}</h3>
              {acc.description && <p className="text-muted text-sm mb-6 leading-relaxed line-clamp-3">{acc.description}</p>}
              <div className="flex items-center gap-3 pt-4 border-t border-hairline/50 mt-auto">
                {acc.sets_reps && <span className="px-3 py-1 bg-lacquer/80 border border-hairline rounded-full text-[10px] font-bold text-champagne">{acc.sets_reps}</span>}
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  acc.difficulty === 'beginner' ? 'bg-patina/10 text-patina border border-patina/30' :
                  acc.difficulty === 'intermediate' ? 'bg-gold/10 text-gold border border-gold/30' :
                  'bg-danger/10 text-danger border border-danger/30'
                }`}>
                  {acc.difficulty}
                </span>
              </div>
            </div>
          ))}
          {accessories.length === 0 && (
            <div className="col-span-full py-24 text-center bg-raised/20 border border-hairline border-dashed rounded-3xl animate-fade-in-scale">
              <p className="text-muted text-lg italic font-light">No accessories matching your criteria were found.</p>
            </div>
          )}
        </div>
      </main>
      <FloatingChat
        mode="dashboard"
        onSend={async (msg: string) => {
          const res = await dashboardChat(msg)
          return res.data.data.reply
        }}
      />
    </div>
  )
}
