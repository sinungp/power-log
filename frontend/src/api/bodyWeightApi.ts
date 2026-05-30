import axiosInstance from './axiosInstance'
import type { ApiResponse, BodyWeightLog, LatestBodyWeight } from '../types'

export async function getBodyWeights(limit = 12) {
  return axiosInstance.get<ApiResponse<BodyWeightLog[]>>(`/body-weight?limit=${limit}`)
}

export async function createBodyWeight(data: { weight_kg: number; logged_at: string; notes?: string }) {
  return axiosInstance.post<ApiResponse<BodyWeightLog>>('/body-weight', data)
}

export async function updateBodyWeight(id: number, data: { weight_kg: number; logged_at: string; notes?: string }) {
  return axiosInstance.put<ApiResponse<BodyWeightLog>>(`/body-weight/${id}`, data)
}

export async function deleteBodyWeight(id: number) {
  return axiosInstance.delete<ApiResponse<null>>(`/body-weight/${id}`)
}

export async function getLatestBodyWeight(sex = 'male') {
  return axiosInstance.get<ApiResponse<LatestBodyWeight>>(`/body-weight/latest?sex=${sex}`)
}
