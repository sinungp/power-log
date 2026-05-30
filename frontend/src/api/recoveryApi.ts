import axiosInstance from './axiosInstance'
import type { ApiResponse, RecoveryLog, RecoveryLogsResponse, RecoverySummary } from '../types'

export async function getRecoveryLogs(days = 7) {
  return axiosInstance.get<ApiResponse<RecoveryLogsResponse>>(`/recovery?days=${days}`)
}

export async function createRecoveryLog(data: {
  logged_at: string
  sleep_hours: number
  sleep_quality: number
  stress_level: number
  doms_level?: number
  notes?: string
}) {
  return axiosInstance.post<ApiResponse<RecoveryLog>>('/recovery', data)
}

export async function updateRecoveryLog(id: number, data: {
  logged_at: string
  sleep_hours: number
  sleep_quality: number
  stress_level: number
  doms_level?: number
  notes?: string
}) {
  return axiosInstance.put<ApiResponse<RecoveryLog>>(`/recovery/${id}`, data)
}

export async function deleteRecoveryLog(id: number) {
  return axiosInstance.delete<ApiResponse<null>>(`/recovery/${id}`)
}

export async function getRecoverySummary(weeks = 4) {
  return axiosInstance.get<ApiResponse<RecoverySummary>>(`/recovery/summary?weeks=${weeks}`)
}
