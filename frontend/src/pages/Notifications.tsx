import { useState, useEffect } from 'react'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notificationApi'
import type { Notification } from '../types'

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifs = () => {
    getNotifications(50).then((res) => {
      setNotifications(res.data.data.notifications || [])
      setUnreadCount(res.data.data.unread_count || 0)
    }).catch(() => {})
  }

  useEffect(() => { fetchNotifs() }, [])

  const handleRead = async (id: number) => {
    await markNotificationRead(id)
    fetchNotifs()
  }

  const handleReadAll = async () => {
    await markAllNotificationsRead()
    fetchNotifs()
  }

  const typeLabels: Record<string, string> = {
    reminder_recovery: 'Pengingat Recovery',
    reminder_lift: 'Pengingat Latihan',
    goal_achieved: 'Goal Tercapai',
    goal_near: 'Goal Mendekat',
    competition_countdown: 'Hitung Mundur Kompetisi',
    general: 'Umum',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-light text-champagne">Notifikasi</h1>
          <p className="text-muted text-sm">{unreadCount} belum dibaca</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleReadAll}
            className="px-3 py-1 text-xs border border-hairline text-muted hover:text-champagne">
            Tandai semua sudah dibaca
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">Tidak ada notifikasi</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-raised border p-4 cursor-pointer transition-colors hover:bg-hovered ${n.is_read ? 'border-hairline' : 'border-gold/20'}`}
              onClick={() => { if (!n.is_read) handleRead(n.id) }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] px-2 py-0.5 bg-hairline text-muted border border-hairline">
                    {typeLabels[n.type] || n.type}
                  </span>
                  <h3 className="text-sm font-semibold text-champagne mt-1">{n.title}</h3>
                  <p className="text-xs text-muted mt-1">{n.message}</p>
                </div>
                <span className="text-[10px] text-muted whitespace-nowrap">{new Date(n.sent_at).toLocaleDateString()}</span>
              </div>
              {!n.is_read && <span className="text-[10px] text-gold mt-2 inline-block">Klik untuk tandai sudah dibaca</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
