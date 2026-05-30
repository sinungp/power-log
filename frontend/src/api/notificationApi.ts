import axiosInstance from './axiosInstance'
import type { ApiResponse, NotificationsResponse, NotificationPreference } from '../types'

export async function getNotifications(limit = 20, unreadOnly = false) {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (unreadOnly) params.set('unread_only', 'true')
  return axiosInstance.get<ApiResponse<NotificationsResponse>>(`/notifications?${params}`)
}

export async function markNotificationRead(id: number) {
  return axiosInstance.put<ApiResponse<null>>(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead() {
  return axiosInstance.put<ApiResponse<null>>('/notifications/read-all')
}

export async function getNotificationPreferences() {
  return axiosInstance.get<ApiResponse<NotificationPreference>>('/notifications/preferences')
}

export async function updateNotificationPreferences(data: NotificationPreference) {
  return axiosInstance.put<ApiResponse<NotificationPreference>>('/notifications/preferences', data)
}
