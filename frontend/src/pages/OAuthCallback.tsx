import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axiosInstance from '../api/axiosInstance'
import type { ApiResponse, AuthResponse } from '../types'

export default function OAuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')

    if (error) {
      navigate('/login?error=' + encodeURIComponent(error))
      return
    }

    if (!token) {
      navigate('/login?error=No token received')
      return
    }

    localStorage.setItem('token', token)

    axiosInstance
      .get<ApiResponse<AuthResponse>>('/auth/me')
      .then((res) => {
        const user = res.data.data as unknown as { id: number; name: string; email: string; plan: string }
        setAuth(
          { id: user.id, name: user.name, email: user.email, plan: user.plan as 'free' | 'pro' },
          token,
        )
        navigate('/app/dashboard')
      })
      .catch(() => {
        navigate('/login?error=Failed to fetch profile')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-lacquer">
      <div className="text-center">
        <div className="spinner-weight mx-auto mb-4" />
        <p className="text-muted">Signing you in&hellip;</p>
      </div>
    </div>
  )
}
