import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axiosInstance from '../api/axiosInstance'
import { useAuthStore } from '../store/authStore'
import type { ApiResponse, AuthResponse } from '../types'

const OAUTH_URL = import.meta.env.VITE_OAUTH_URL || 'http://localhost:8080'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

const oauthProviders = [
  { id: 'google', label: 'Google', icon: 'G' },
  { id: 'facebook', label: 'Facebook', icon: 'f' },
  { id: 'x', label: 'X', icon: 'X' },
] as const

export default function Login() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const oauthError = params.get('error')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data)
      const { user, token } = res.data.data
      setAuth(user, token)
      navigate('/app/dashboard')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-lacquer px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-display text-gold tracking-wide">PowerLog</Link>
          <h1 className="text-2xl font-light text-champagne mt-4">Welcome Back</h1>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {/* OAuth buttons */}
        <div className="flex flex-col gap-2 mb-4">
          {oauthProviders.map((p) => (
            <a
              key={p.id}
              href={`${OAUTH_URL}/oauth/${p.id}/login`}
              className="flex items-center justify-center gap-3 bg-raised border border-hairline text-body py-2.5 rounded-sm hover:bg-hovered hover:border-gold/30 text-sm"
            >
              <span className="w-6 h-6 flex items-center justify-center font-bold text-xs border border-hairline text-muted">
                {p.icon}
              </span>
              Continue with {p.label}
            </a>
          ))}
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-lacquer px-3 text-muted">or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-raised p-8 border border-hairline space-y-4">
          {(error || oauthError) && (
            <div className="bg-danger/10 text-danger p-3 text-sm">{error || oauthError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none placeholder:text-muted"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-danger text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-champagne mb-1">Password</label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-4 py-2 bg-lacquer border border-hairline text-body rounded-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none placeholder:text-muted"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-danger text-sm mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold text-lacquer rounded-sm font-semibold hover:bg-gold-dim disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-gold hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
