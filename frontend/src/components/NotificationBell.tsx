import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useNotificationStore } from '../store/notificationStore'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, startPolling, stopPolling } = useNotificationStore()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startPolling()
    return () => stopPolling()
  }, [startPolling, stopPolling])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center text-muted hover:text-gold border border-hairline hover:border-gold relative"
        aria-label="Notifications"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[9px] flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-72 bg-raised border border-hairline z-50 shadow-xl">
          <div className="p-3 border-b border-hairline flex justify-between items-center">
            <span className="text-sm font-semibold text-champagne">Notifikasi</span>
            <Link to="/app/notifications" className="text-xs text-gold" onClick={() => setOpen(false)}>
              Lihat semua
            </Link>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-muted p-4 text-center">Tidak ada notifikasi</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 border-b border-hairline hover:bg-hovered cursor-pointer"
                  onClick={() => { if (!n.is_read) { markRead(n.id) } }}
                >
                  <p className="text-xs font-semibold text-champagne">{n.title}</p>
                  <p className="text-[11px] text-muted truncate">{n.message}</p>
                  <p className="text-[10px] text-muted mt-1">{new Date(n.sent_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
