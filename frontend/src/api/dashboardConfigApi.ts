import axiosInstance from './axiosInstance'
import type { ApiResponse, DashboardConfig } from '../types'

export async function getDashboardConfig() {
  return axiosInstance.get<ApiResponse<DashboardConfig>>('/dashboard/config')
}

export async function updateDashboardConfig(widgets: Record<string, boolean>) {
  return axiosInstance.put<ApiResponse<DashboardConfig>>('/dashboard/config', { widgets })
}
