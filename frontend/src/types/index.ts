export interface User {
  id: number
  name: string
  email: string
  plan: 'free' | 'pro'
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LiftRecord {
  id: number
  user_id: number
  lift_type: 'squat' | 'bench' | 'deadlift'
  weight_kg: number
  reps: number
  rpe?: number
  notes?: string
  lifted_at: string
  created_at: string
}

export interface Accessory {
  id: number
  target_lift: 'squat' | 'bench' | 'deadlift' | 'general'
  name: string
  description?: string
  sets_reps?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface Checklist {
  id: number
  type: 'warmup' | 'cooldown'
  name: string
  description?: string
  duration_sec?: number
}

export interface ChecklistLog {
  id: number
  user_id: number
  checklist_id: number
  is_done: boolean
  logged_at: string
}

export interface OneRMResults {
  epley: number
  brzycki: number
  lombardi: number
  warning?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
