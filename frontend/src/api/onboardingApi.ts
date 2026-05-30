import axiosInstance from './axiosInstance'
import type { ApiResponse, OnboardingStatus, UserProfile } from '../types'

export async function getOnboardingStatus() {
  return axiosInstance.get<ApiResponse<OnboardingStatus>>('/onboarding/status')
}

export async function saveProfile(data: {
  sex: string
  birth_date?: string
  experience_level: string
  has_competed: boolean
}) {
  return axiosInstance.post<ApiResponse<UserProfile>>('/onboarding/profile', data)
}

export async function saveTrainingPreference(data: {
  training_days_week: number
  primary_focus: string
  equipment_type: string
}) {
  return axiosInstance.post<ApiResponse<UserProfile>>('/onboarding/training-preference', data)
}

export async function completeOnboarding() {
  return axiosInstance.post<ApiResponse<{ onboarding_done: boolean }>>('/onboarding/complete')
}
