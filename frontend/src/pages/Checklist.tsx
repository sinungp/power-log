import { useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'
import type { ApiResponse, Checklist, ChecklistLog } from '../types'
import FloatingChat from '../components/FloatingChat'
import { dashboardChat } from '../api/chatApi'

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [logs, setLogs] = useState<ChecklistLog[]>([])
  const [type, setType] = useState<'warmup' | 'cooldown'>('warmup')

  const today = new Date().toISOString().split('T')[0]

  const fetchData = async () => {
    try {
      const [checklistRes, logsRes] = await Promise.all([
        axiosInstance.get<ApiResponse<Checklist[]>>(`/checklists?type=${type}`),
        axiosInstance.get<ApiResponse<ChecklistLog[]>>(`/checklists/log?date=${today}`),
      ])
      setChecklists(checklistRes.data.data || [])
      setLogs(logsRes.data.data || [])
    } catch {
      // ignore
    }
  }

  useEffect(() => { fetchData() }, [type])

  const getLog = (checklistId: number) => logs.find((l) => l.checklist_id === checklistId)

  const toggleCheck = async (checklistId: number, currentStatus: boolean) => {
    try {
      await axiosInstance.post('/checklists/log', {
        checklist_id: checklistId,
        is_done: !currentStatus,
      })
      fetchData()
    } catch {
      // ignore
    }
  }

  const doneCount = checklists.filter((c) => getLog(c.id)?.is_done).length
  const progressPct = checklists.length > 0 ? (doneCount / checklists.length) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-champagne uppercase">
            Training <span className="text-gold font-bold">{type}</span>
          </h1>
          <p className="text-muted mt-2 text-lg">Optimalkan performa dan pemulihan dengan checklist terstruktur.</p>
        </div>
        <div className="flex bg-raised/50 p-1 border border-hairline rounded-2xl shadow-inner">
          {(['warmup', 'cooldown'] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} 
              className={`px-8 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${type === t ? 'bg-gold text-lacquer shadow-lg' : 'text-muted hover:text-champagne'}`}>
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-raised/50 backdrop-blur-md p-6 sm:p-10 border border-hairline rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-gold transition-all duration-1000" style={{ width: `${progressPct}%` }} />
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-xl font-bold text-champagne mb-1">Today's Progress</h2>
            <p className="text-sm text-muted">Selesaikan semua poin untuk hasil maksimal.</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-gold">{doneCount}</span>
            <span className="text-xl font-light text-muted">/{checklists.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {checklists.map((item) => {
            const log = getLog(item.id)
            const isDone = log?.is_done || false
            return (
              <label key={item.id} className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all cursor-pointer group ${isDone ? 'bg-lacquer/30 border-patina/20 opacity-60' : 'bg-lacquer border-hairline hover:border-gold/50 hover:bg-hovered/50 shadow-lg'}`}>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleCheck(item.id, isDone)}
                    className="peer sr-only"
                  />
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'bg-patina border-patina' : 'border-hairline group-hover:border-gold'}`}>
                    {isDone && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold transition-all ${isDone ? 'line-through text-muted' : 'text-champagne'}`}>{item.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {item.duration_sec && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-muted uppercase tracking-wider">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {item.duration_sec} detik
                      </span>
                    )}
                    <span className="w-1 h-1 bg-muted/30 rounded-full" />
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{type === 'warmup' ? 'Aktivasi' : 'Relaksasi'}</span>
                  </div>
                </div>
                {!isDone && <span className="text-xs font-black text-gold opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">Selesaikan</span>}
              </label>
            )
          })}
          
          {checklists.length === 0 && (
            <div className="py-20 text-center bg-lacquer/20 border-2 border-hairline border-dashed rounded-3xl">
              <p className="text-muted text-lg italic font-light">Belum ada item checklist untuk kategori ini.</p>
            </div>
          )}
        </div>
      </div>
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
