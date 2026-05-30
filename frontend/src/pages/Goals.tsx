import { useState, useEffect } from 'react'
import { getGoalProgress, createGoal, deleteGoal, achieveGoal } from '../api/goalApi'
import type { GoalProgress } from '../types'
import GoalProgressCard from '../components/GoalProgressCard'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-light text-champagne">Goals</h1>
          <p className="text-muted text-sm">Target dan progress latihan</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gold text-lacquer font-semibold text-sm hover:bg-gold-dim">
          + Tambah Goal
        </button>
      </div>

      <div className="flex gap-2">
        {['active', 'achieved', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs border ${filter === f ? 'border-gold text-gold bg-gold/10' : 'border-hairline text-muted hover:text-champagne'}`}>
            {f === 'active' ? 'Aktif' : f === 'achieved' ? 'Tercapai' : 'Semua'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">Belum ada goal. Buat goal pertamamu!</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowForm(false)}>
          <div className="bg-raised border border-hairline w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-champagne mb-4">Tambah Goal Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1">Tipe Goal</label>
                <select value={form.goal_type} onChange={(e) => setForm({ ...form, goal_type: e.target.value })}
                  className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none">
                  {goalTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {form.goal_type !== 'competition' && (
                <div>
                  <label className="text-xs text-muted block mb-1">Target ({form.goal_type === 'body_weight' ? 'kg' : 'kg'})</label>
                  <input type="number" step="0.1" min="0" value={form.target_value || ''}
                    onChange={(e) => setForm({ ...form, target_value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
                </div>
              )}
              <div>
                <label className="text-xs text-muted block mb-1">Target Tanggal (opsional)</label>
                <input type="date" value={form.target_date}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                  className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
              </div>
              {form.goal_type === 'competition' && (
                <>
                  <div>
                    <label className="text-xs text-muted block mb-1">Nama Kompetisi</label>
                    <input type="text" value={form.competition_name}
                      onChange={(e) => setForm({ ...form, competition_name: e.target.value })}
                      className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Federasi</label>
                    <input type="text" value={form.federation}
                      onChange={(e) => setForm({ ...form, federation: e.target.value })}
                      className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs text-muted block mb-1">Catatan (opsional)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none resize-none" rows={3} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreate}
                className="flex-1 py-2 bg-gold text-lacquer font-semibold text-sm hover:bg-gold-dim">
                Simpan
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-hairline text-muted text-sm hover:text-champagne">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
