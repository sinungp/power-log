import axiosInstance from './axiosInstance'
import type { ApiResponse } from '../types'

export function publicChat(message: string) {
  return axiosInstance.post<ApiResponse<{ reply: string }>>('/chat/public', { message })
}

export function dashboardChat(message: string) {
  return axiosInstance.post<ApiResponse<{ reply: string }>>('/chat', { message })
}
