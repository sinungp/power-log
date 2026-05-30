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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Checklist</h1>
          <p className="text-gray-500">{doneCount}/{checklists.length} completed today</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setType('warmup')} className={`px-4 py-2 rounded-lg text-sm ${type === 'warmup' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
            Warmup
          </button>
          <button onClick={() => setType('cooldown')} className={`px-4 py-2 rounded-lg text-sm ${type === 'cooldown' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            Cooldown
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm divide-y">
        {checklists.map((item) => {
          const log = getLog(item.id)
          const isDone = log?.is_done || false
          return (
            <label key={item.id} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => toggleCheck(item.id, isDone)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600"
              />
              <div className="flex-1">
                <span className={isDone ? 'line-through text-gray-400' : ''}>{item.name}</span>
                {item.duration_sec && (
                  <span className="ml-2 text-xs text-gray-400">{item.duration_sec}s</span>
                )}
              </div>
            </label>
          )
        })}
        {checklists.length === 0 && (
          <p className="p-6 text-center text-gray-400">No checklist items found</p>
        )}
      </div>
    </div>
  )
}
