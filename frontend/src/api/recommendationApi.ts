import axiosInstance from './axiosInstance'
import type { ApiResponse, Recommendation } from '../types'

export async function getRecommendations(category?: string, limit = 5) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  params.set('limit', String(limit))
  return axiosInstance.get<ApiResponse<Recommendation[]>>(`/recommendations?${params}`)
}

export async function generateRecommendations() {
  return axiosInstance.post<ApiResponse<Recommendation[]>>('/recommendations/generate')
}

export async function requestAIAnalysis(contextWeeks = 4) {
  return axiosInstance.post<ApiResponse<Recommendation>>('/recommendations/ai-analysis', { context_weeks: contextWeeks })
}

export async function markRecommendationRead(id: number) {
  return axiosInstance.put<ApiResponse<null>>(`/recommendations/${id}/read`)
}
