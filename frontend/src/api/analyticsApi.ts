import axiosInstance from './axiosInstance'
import type { ApiResponse, WeekVolume, IntensityDistribution, LiftRatio, WilksResult } from '../types'

export async function getVolumeWeekly(weeks = 4) {
  return axiosInstance.get<ApiResponse<WeekVolume[]>>(`/analytics/volume-weekly?weeks=${weeks}`)
}

export async function getIntensityDistribution(lift: string, weeks = 4) {
  return axiosInstance.get<ApiResponse<IntensityDistribution>>(`/analytics/intensity-distribution?lift=${lift}&weeks=${weeks}`)
}

export async function getLiftRatio() {
  return axiosInstance.get<ApiResponse<LiftRatio>>('/analytics/lift-ratio')
}

export async function calculateWilks(data: { body_weight_kg: number; total_kg: number; sex: string }) {
  return axiosInstance.post<ApiResponse<WilksResult>>('/calculator/wilks', data)
}
