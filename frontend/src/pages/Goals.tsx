import { useState, useEffect } from 'react'
import { getGoalProgress, createGoal, deleteGoal, achieveGoal } from '../api/goalApi'
import type { GoalProgress } from '../types'
import GoalProgressCard from '../components/GoalProgressCard'
import FloatingChat from '../components/FloatingChat'
import { dashboardChat } from '../api/chatApi'

const goalTypes = [
  { value: 'squat_1rm', label: 'Squat 1RM' },
  { value: 'bench_1rm', label: 'Bench 1RM' },
  { value: 'deadlift_1rm', label: 'Deadlift 1RM' },
  { value: 'body_weight', label: 'Berat Badan' },
  { value: 'competition', label: 'Kompetisi' },
]

export default function Goals() {
  const [goals, setGoals] = useState<GoalProgress[]>([])
  const [filter, setFilter] = useState('active')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    goal_type: 'squat_1rm',
    target_value: 0,
    target_date: '',
    competition_name: '',
    federation: '',
    notes: '',
  })

  const fetchGoals = () => {
    getGoalProgress().then((res) => setGoals(res.data.data || [])).catch(() => {})
  }

  useEffect(() => { fetchGoals() }, [])

  const handleCreate = async () => {
    try {
      await createGoal(form)
      setShowForm(false)
      setForm({ goal_type: 'squat_1rm', target_value: 0, target_date: '', competition_name: '', federation: '', notes: '' })
      fetchGoals()
    } catch { /* ignore */ }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus goal ini?')) return
    await deleteGoal(id)
    fetchGoals()
  }

  const handleAchieve = async (id: number) => {
    await achieveGoal(id)
    fetchGoals()
  }

  const filtered = goals.filter((g) => {
    if (filter === 'active') return !g.is_achieved
    if (filter === 'achieved') return g.is_achieved
    return true
  })

  return (
    <div className="w-full space-y-10 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-champagne">
            Personal <span className="text-gold font-normal">Goals</span>
          </h1>
          <p className="text-muted mt-1">Target angkatan, berat badan, dan kompetisi.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-lacquer font-bold rounded-xl shadow-lg shadow-gold/20 hover:bg-gold-dim transition-all text-sm uppercase tracking-widest">
          + Tambah Goal
        </button>
      </header>

      <div className="flex flex-wrap gap-1 bg-raised/30 p-1 border border-hairline rounded-xl w-fit">
        {['active', 'achieved', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-6 py-2 text-xs font-medium rounded-lg transition-all ${filter === f ? 'bg-gold text-lacquer shadow-lg shadow-gold/20' : 'text-muted hover:text-champagne hover:bg-hovered/50'}`}>
            {f === 'active' ? 'Aktif' : f === 'achieved' ? 'Tercapai' : 'Semua'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-raised/30 border border-hairline border-dashed rounded-2xl py-20 text-center">
          <p className="text-muted italic">Belum ada goal yang sesuai filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((g) => (
            <GoalProgressCard
              key={g.id}
              goal={g}
              onDelete={() => handleDelete(g.id)}
              onAchieve={g.is_achieved ? undefined : () => handleAchieve(g.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="bg-raised border border-hairline w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8 animate-fade-in-scale max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-champagne">Buat Goal <span className="text-gold">Baru</span></h2>
              <button onClick={() => setShowForm(false)} className="text-muted hover:text-champagne transition-colors text-2xl">&times;</button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Tipe Goal</label>
                  <select value={form.goal_type} onChange={(e) => setForm({ ...form, goal_type: e.target.value })}
                    className="w-full bg-lacquer border border-hairline rounded-xl px-4 py-3 text-sm text-champagne focus:border-gold outline-none transition-all">
                    {goalTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Target Tanggal</label>
                  <input type="date" value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                    className="w-full bg-lacquer border border-hairline rounded-xl px-4 py-3 text-sm text-champagne focus:border-gold outline-none transition-all" />
                </div>
              </div>

              {form.goal_type !== 'competition' ? (
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Target Nilai</label>
                  <input type="number" step="0.1" min="0" value={form.target_value || ''}
                    onChange={(e) => setForm({ ...form, target_value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-lacquer border border-hairline rounded-xl px-4 py-3 text-lg font-bold text-gold focus:border-gold outline-none transition-all" placeholder="0.0" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Nama Kompetisi</label>
                    <input type="text" value={form.competition_name}
                      onChange={(e) => setForm({ ...form, competition_name: e.target.value })}
                      className="w-full bg-lacquer border border-hairline rounded-xl px-4 py-3 text-sm text-champagne focus:border-gold outline-none transition-all" placeholder="National Open 2024" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Federasi</label>
                    <input type="text" value={form.federation}
                      onChange={(e) => setForm({ ...form, federation: e.target.value })}
                      className="w-full bg-lacquer border border-hairline rounded-xl px-4 py-3 text-sm text-champagne focus:border-gold outline-none transition-all" placeholder="PABSI / IPF" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Catatan Tambahan</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-lacquer border border-hairline rounded-xl px-4 py-3 text-sm text-champagne focus:border-gold outline-none resize-none transition-all" rows={3} placeholder="Apa rencanamu untuk mencapai ini?" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button onClick={handleCreate}
                className="flex-1 py-4 bg-gold text-lacquer font-bold rounded-xl shadow-lg shadow-gold/20 hover:bg-gold-dim transition-all uppercase tracking-widest text-sm">
                Simpan Goal
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-8 py-4 border border-hairline text-muted font-bold rounded-xl hover:bg-hovered hover:text-champagne transition-all uppercase tracking-widest text-sm">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
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
