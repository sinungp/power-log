import axiosInstance from './axiosInstance'
import type { ApiResponse, UserGoal, GoalProgress } from '../types'

export async function getGoals(filter?: string) {
  const params = filter ? `?filter=${filter}` : ''
  return axiosInstance.get<ApiResponse<UserGoal[]>>(`/goals${params}`)
}

export async function createGoal(data: {
  goal_type: string
  target_value: number
  target_date?: string
  competition_name?: string
  federation?: string
  notes?: string
}) {
  return axiosInstance.post<ApiResponse<UserGoal>>('/goals', data)
}

export async function updateGoal(id: number, data: {
  goal_type: string
  target_value: number
  target_date?: string
  competition_name?: string
  federation?: string
  notes?: string
}) {
  return axiosInstance.put<ApiResponse<UserGoal>>(`/goals/${id}`, data)
}

export async function deleteGoal(id: number) {
  return axiosInstance.delete<ApiResponse<null>>(`/goals/${id}`)
}

export async function getGoalProgress() {
  return axiosInstance.get<ApiResponse<GoalProgress[]>>('/goals/progress')
}

export async function achieveGoal(id: number) {
  return axiosInstance.post<ApiResponse<UserGoal>>(`/goals/${id}/achieve`)
}
