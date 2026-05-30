import { create } from 'zustand'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notificationApi'
import type { Notification } from '../types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isPolling: boolean
  pollInterval: ReturnType<typeof setInterval> | null
  fetchUnread: () => Promise<void>
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isPolling: false,
  pollInterval: null,

  fetchUnread: async () => {
    try {
      const res = await getNotifications(5, true)
      set({
        notifications: res.data.data.notifications,
        unreadCount: res.data.data.unread_count,
      })
    } catch {
      // silent fail
    }
  },

  markRead: async (id: number) => {
    try {
      await markNotificationRead(id)
      const { notifications, unreadCount } = get()
      set({
        notifications: notifications.filter((n) => n.id !== id),
        unreadCount: Math.max(0, unreadCount - 1),
      })
    } catch {
      // silent fail
    }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsRead()
      set({ notifications: [], unreadCount: 0 })
    } catch {
      // silent fail
    }
  },

  startPolling: () => {
    const { isPolling, pollInterval } = get()
    if (isPolling) return
    if (pollInterval) clearInterval(pollInterval)

    get().fetchUnread()
    const interval = setInterval(() => {
      get().fetchUnread()
    }, 60000)

    set({ isPolling: true, pollInterval: interval })
  },

  stopPolling: () => {
    const { pollInterval } = get()
    if (pollInterval) {
      clearInterval(pollInterval)
    }
    set({ isPolling: false, pollInterval: null })
  },
}))
