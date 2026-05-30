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

// -- Addon types --

export interface BodyWeightLog {
  id: number
  user_id: number
  weight_kg: number
  logged_at: string
  notes?: string
  created_at: string
}

export interface LatestBodyWeight {
  weight_kg: number
  logged_at: string
  recommended_class: string
  next_class_up: string
  next_class_down: string
}

export interface RecoveryLog {
  id: number
  user_id: number
  logged_at: string
  sleep_hours: number
  sleep_quality: number
  stress_level: number
  doms_level?: number
  notes?: string
  created_at: string
}

export interface RecoveryLogsResponse {
  logs: RecoveryLog[]
  averages: {
    avg_sleep_hours: number
    avg_sleep_quality: number
    avg_stress_level: number
    avg_doms_level: number
  }
}

export interface RecoverySummary {
  avg_sleep_hours: number
  avg_sleep_quality: number
  avg_stress_level: number
  avg_doms_level: number
  recovery_score: number
  trend: 'improving' | 'declining' | 'stable'
}

export interface WeekVolume {
  week_start: string
  week_end: string
  squat_volume_kg: number
  bench_volume_kg: number
  deadlift_volume_kg: number
  total_volume_kg: number
  avg_intensity_pct: number
}

export interface IntensityDistribution {
  zone_1_recovery: number
  zone_2_hypertrophy: number
  zone_3_strength: number
  zone_4_peaking: number
  total_sessions: number
}

export interface LiftRatio {
  squat_1rm: number
  bench_1rm: number
  deadlift_1rm: number
  bench_to_squat_pct: number
  deadlift_to_squat_pct: number
  squat_to_bodyweight: number
  bench_to_bodyweight: number
  deadlift_to_bodyweight: number
  weakness: string
  weakness_note: string
}

export interface WilksResult {
  wilks_score: number
  ipf_gl_score: number
}
