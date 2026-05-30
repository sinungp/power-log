import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axiosInstance from '../api/axiosInstance'
import type { ApiResponse, OneRMResults } from '../types'
import FloatingChat from '../components/FloatingChat'
import { dashboardChat } from '../api/chatApi'

const schema = z.object({
  weight_kg: z.coerce.number().positive('Weight must be positive'),
  reps: z.coerce.number().int().positive('Reps must be positive'),
})

export default function Calculator() {
  const [result, setResult] = useState<OneRMResults | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const res = await axiosInstance.post<ApiResponse<OneRMResults>>('/calculator/one-rm', data)
      setResult(res.data.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up">
      <header className="text-center sm:text-left">
        <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-champagne">
          1RM <span className="text-gold font-normal">Calculator</span>
        </h1>
        <p className="text-muted mt-2 text-lg">Estimate your absolute strength across different rep ranges.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 bg-raised/50 backdrop-blur-md p-6 sm:p-10 border border-hairline rounded-3xl shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-16 -mt-16 group-hover:bg-gold/10 transition-all" />
          <h2 className="text-xl font-bold text-champagne">Input <span className="text-gold">Data</span></h2>
          
          <div className="space-y-6 relative z-10">
            <div className="group">
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-3">Weight Lifted (kg)</label>
              <input
                type="number"
                step="0.01"
                {...register('weight_kg')}
                className="w-full px-6 py-4 bg-lacquer border border-hairline text-champagne text-2xl font-black rounded-2xl focus:border-gold outline-none transition-all placeholder:text-muted/30"
                placeholder="0.0"
              />
              {errors.weight_kg && <p className="text-danger text-[10px] font-bold mt-2 uppercase">{errors.weight_kg.message}</p>}
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-3">Reps Performed</label>
              <input
                type="number"
                {...register('reps')}
                className="w-full px-6 py-4 bg-lacquer border border-hairline text-champagne text-2xl font-black rounded-2xl focus:border-gold outline-none transition-all placeholder:text-muted/30"
                placeholder="0"
              />
              {errors.reps && <p className="text-danger text-[10px] font-bold mt-2 uppercase">{errors.reps.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gold text-lacquer rounded-2xl font-black shadow-xl shadow-gold/20 hover:bg-gold-dim transition-all disabled:opacity-50 text-base uppercase tracking-widest relative z-10"
          >
            {loading ? 'Calculating...' : 'Generate Estimates'}
          </button>
        </form>

        <div className="lg:col-span-3 space-y-6">
          {result ? (
            <div className="bg-raised/30 backdrop-blur-sm p-6 sm:p-10 border border-hairline rounded-3xl shadow-xl animate-fade-in-scale">
              <h2 className="text-xl font-bold text-champagne mb-8">Estimated <span className="text-gold">Results</span></h2>
              {result.warning && (
                <div className="bg-danger/10 text-danger p-4 rounded-xl text-xs border border-danger/20 mb-8 flex items-center gap-3 italic">
                  <span>⚠️</span> {result.warning}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Epley', val: result.epley, desc: 'General use' },
                  { label: 'Brzycki', val: result.brzycki, desc: 'Best for <10 reps' },
                  { label: 'Lombardi', val: result.lombardi, desc: 'Conservative' }
                ].map((item) => (
                  <div key={item.label} className="bg-lacquer/50 p-6 border border-hairline rounded-2xl text-center hover:border-gold/30 transition-all group">
                    <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-3xl font-black text-gold group-hover:scale-110 transition-transform mb-1">{item.val}<span className="text-xs ml-0.5">kg</span></p>
                    <p className="text-[10px] text-muted/60 italic">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-hairline/50">
                <p className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Intensity Training Zones (Epley)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[100, 90, 80, 70].map((pct) => (
                    <div key={pct} className="bg-lacquer/30 p-4 border border-hairline rounded-xl text-center">
                      <p className="text-[10px] font-medium text-muted mb-1">{pct}%</p>
                      <p className="text-lg font-bold text-champagne">{(result.epley * (pct/100)).toFixed(1)}kg</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-raised/10 border-2 border-hairline border-dashed rounded-3xl p-20 text-center">
              <div className="text-6xl mb-6 opacity-20">📊</div>
              <h3 className="text-xl font-light text-muted">Ready to calculate?</h3>
              <p className="text-sm text-muted/60 mt-2">Enter your weight and reps on the left to see your potential 1RM estimates across different models.</p>
            </div>
          )}
        </div>
      </div>
      <FloatingChat
        mode="dashboard"
        onSend={async (msg: string) => {
          const res = await dashboardChat(msg)
          return res.data.data.reply
        }}
      />
    </div>
  )
}
