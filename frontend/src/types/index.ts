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

// -- Personalization types --

export interface UserProfile {
  id: number
  user_id: number
  sex: 'male' | 'female'
  birth_date?: string
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  has_competed: boolean
  training_days_week: number
  primary_focus: 'sbd' | 'squat' | 'bench' | 'deadlift'
  equipment_type: 'full' | 'home' | 'minimal'
  onboarding_done: boolean
  created_at: string
  updated_at: string
}

export interface OnboardingStatus {
  onboarding_done: boolean
  current_step: number
}

export interface UserGoal {
  id: number
  user_id: number
  goal_type: 'squat_1rm' | 'bench_1rm' | 'deadlift_1rm' | 'body_weight' | 'competition'
  target_value: number
  target_date?: string
  competition_name?: string
  federation?: string
  is_achieved: boolean
  achieved_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface GoalProgress extends UserGoal {
  current_value: number
  progress_pct: number
  estimated_date?: string
  days_remaining: number
}

export interface Recommendation {
  id: number
  user_id: number
  source: 'rule' | 'ai'
  category: 'volume' | 'recovery' | 'weakness' | 'peaking' | 'general'
  title: string
  body: string
  is_read: boolean
  generated_at: string
  expires_at?: string
}

export interface Notification {
  id: number
  user_id: number
  type: 'reminder_recovery' | 'reminder_lift' | 'goal_achieved' | 'goal_near' | 'competition_countdown' | 'general'
  title: string
  message: string
  is_read: boolean
  sent_at: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
}

export interface NotificationPreference {
  reminder_recovery: boolean
  reminder_recovery_time: string
  reminder_lift: boolean
  reminder_lift_days: string
  telegram_chat_id?: string
}

export interface DashboardConfig {
  widgets: {
    pr_summary: boolean
    weekly_volume: boolean
    recovery_score: boolean
    goal_progress: boolean
    recommendation: boolean
    wilks_score: boolean
    weight_class: boolean
    lift_ratio: boolean
  }
}
