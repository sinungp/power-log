import { useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'
import type { ApiResponse, Checklist, ChecklistLog } from '../types'

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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-light text-champagne">Checklist</h1>
          <p className="text-muted">{doneCount}/{checklists.length} completed today</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setType('warmup')} className={`px-4 py-2 text-sm rounded-sm ${type === 'warmup' ? 'bg-patina text-lacquer' : 'border border-hairline text-muted hover:bg-hovered hover:text-champagne'}`}>
            Warmup
          </button>
          <button onClick={() => setType('cooldown')} className={`px-4 py-2 text-sm rounded-sm ${type === 'cooldown' ? 'bg-patina text-lacquer' : 'border border-hairline text-muted hover:bg-hovered hover:text-champagne'}`}>
            Cooldown
          </button>
        </div>
      </div>

      <div className="bg-raised border border-hairline divide-y divide-hairline">
        {checklists.map((item) => {
          const log = getLog(item.id)
          const isDone = log?.is_done || false
          return (
            <label key={item.id} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-hovered transition-colors">
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => toggleCheck(item.id, isDone)}
                className="w-5 h-5 rounded-sm border-hairline text-gold bg-lacquer focus:ring-gold focus:ring-1"
              />
              <div className="flex-1">
                <span className={isDone ? 'line-through text-muted' : 'text-body'}>{item.name}</span>
                {item.duration_sec && (
                  <span className="ml-2 text-xs text-muted">{item.duration_sec}s</span>
                )}
              </div>
            </label>
          )
        })}
        {checklists.length === 0 && (
          <p className="p-6 text-center text-muted">No checklist items found</p>
        )}
      </div>
    </div>
  )
}
