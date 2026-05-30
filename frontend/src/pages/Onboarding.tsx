import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOnboardingStatus, saveProfile, saveTrainingPreference, completeOnboarding } from '../api/onboardingApi'
import OnboardingStep from '../components/OnboardingStep'

const totalSteps = 5

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [sex, setSex] = useState('male')
  const [birthDate, setBirthDate] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('beginner')
  const [hasCompeted, setHasCompeted] = useState(false)
  const [trainingDays, setTrainingDays] = useState(3)
  const [primaryFocus, setPrimaryFocus] = useState('sbd')
  const [equipmentType, setEquipmentType] = useState('full')
  const [reminderRecovery, setReminderRecovery] = useState(true)
  const [recoveryTime, setRecoveryTime] = useState('20:00')
  const [reminderLift, setReminderLift] = useState(true)
  const [liftDays, setLiftDays] = useState('1,3,5')

  useEffect(() => {
    getOnboardingStatus().then((res) => {
      if (res.data.data.onboarding_done) {
        navigate('/app/dashboard')
      }
    }).catch(() => {})
  }, [navigate])

  const handleNext = async () => {
    if (step === 0) {
      setLoading(true)
      await saveProfile({ sex, birth_date: birthDate || undefined, experience_level: experienceLevel, has_competed: hasCompeted })
      setLoading(false)
    } else if (step === 2) {
      setLoading(true)
      await saveTrainingPreference({ training_days_week: trainingDays, primary_focus: primaryFocus, equipment_type: equipmentType })
      setLoading(false)
    } else if (step === 4) {
      setLoading(true)
      await completeOnboarding()
      setLoading(false)
      navigate('/app/dashboard')
      return
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  const handleSkip = async () => {
    setLoading(true)
    await saveProfile({ sex: 'male', experience_level: 'beginner', has_competed: false })
    await saveTrainingPreference({ training_days_week: 3, primary_focus: 'sbd', equipment_type: 'full' })
    await completeOnboarding()
    setLoading(false)
    navigate('/app/dashboard')
  }

  return (
    <div className="min-h-screen bg-lacquer flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-raised border border-hairline p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-display text-gold tracking-wide">PowerLog</h1>
          <button onClick={handleSkip} className="text-xs text-muted hover:text-champagne">
            Skip
          </button>
        </div>

        <div className="flex gap-1 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 ${i <= step ? 'bg-gold' : 'bg-hairline'}`} />
          ))}
        </div>

        {step === 0 && (
          <OnboardingStep title="Data Diri" description="Informasi dasar untuk kalkulasi akurat">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-1">Jenis Kelamin</label>
                <div className="flex gap-3">
                  {['male', 'female'].map((s) => (
                    <button key={s} onClick={() => setSex(s)}
                      className={`flex-1 py-2 text-sm border ${sex === s ? 'border-gold bg-gold/10 text-gold' : 'border-hairline text-muted hover:border-gold/50'}`}>
                      {s === 'male' ? 'Laki-laki' : 'Perempuan'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Tanggal Lahir (opsional)</label>
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Level Pengalaman</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'beginner', label: 'Pemula', desc: '< 6 bulan' },
                    { value: 'intermediate', label: 'Menengah', desc: '6-24 bulan' },
                    { value: 'advanced', label: 'Mahir', desc: '> 24 bulan' },
                  ].map((l) => (
                    <button key={l.value} onClick={() => setExperienceLevel(l.value)}
                      className={`p-3 border text-center ${experienceLevel === l.value ? 'border-gold bg-gold/10 text-gold' : 'border-hairline text-muted hover:border-gold/50'}`}>
                      <span className="text-sm font-semibold block">{l.label}</span>
                      <span className="text-[10px]">{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 py-2">
                <input type="checkbox" checked={hasCompeted} onChange={(e) => setHasCompeted(e.target.checked)}
                  className="accent-gold" />
                <span className="text-sm text-champagne">Pernah ikut kompetisi powerlifting</span>
              </label>
            </div>
          </OnboardingStep>
        )}

        {step === 1 && (
          <OnboardingStep title="Goal Awal" description="Target awal (semua opsional, bisa diubah nanti)">
            <p className="text-sm text-muted py-4">Kamu bisa mengatur goal nanti di halaman Goals.
            {!hasCompeted && <><br/>Jika ingin target kompetisi, centang "Pernah ikut kompetisi" di langkah sebelumnya.</>}</p>
          </OnboardingStep>
        )}

        {step === 2 && (
          <OnboardingStep title="Preferensi Latihan" description="Sesi latihan dan peralatan">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted block mb-2">Hari latihan per minggu: <span className="text-gold">{trainingDays}</span></label>
                <input type="range" min={2} max={6} value={trainingDays} onChange={(e) => setTrainingDays(Number(e.target.value))}
                  className="w-full accent-gold" />
                <div className="flex justify-between text-[10px] text-muted"><span>2</span><span>6</span></div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Fokus Utama</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'sbd', label: 'SBD' },
                    { value: 'squat', label: 'Squat' },
                    { value: 'bench', label: 'Bench' },
                    { value: 'deadlift', label: 'Deadlift' },
                  ].map((f) => (
                    <button key={f.value} onClick={() => setPrimaryFocus(f.value)}
                      className={`py-2 text-sm border ${primaryFocus === f.value ? 'border-gold bg-gold/10 text-gold' : 'border-hairline text-muted hover:border-gold/50'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Peralatan</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'full', label: 'Lengkap' },
                    { value: 'home', label: 'Home Gym' },
                    { value: 'minimal', label: 'Minimal' },
                  ].map((e) => (
                    <button key={e.value} onClick={() => setEquipmentType(e.value)}
                      className={`py-2 text-sm border ${equipmentType === e.value ? 'border-gold bg-gold/10 text-gold' : 'border-hairline text-muted hover:border-gold/50'}`}>
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </OnboardingStep>
        )}

        {step === 3 && (
          <OnboardingStep title="Pengingat" description="Atur notifikasi untuk jadwal latihan dan recovery">
            <div className="space-y-4">
              <label className="flex items-center justify-between py-2">
                <span className="text-sm text-champagne">Pengingat Recovery</span>
                <button onClick={() => setReminderRecovery(!reminderRecovery)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${reminderRecovery ? 'bg-gold' : 'bg-hairline'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-lacquer transition-transform ${reminderRecovery ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
              {reminderRecovery && (
                <div>
                  <label className="text-xs text-muted block mb-1">Jam pengingat</label>
                  <input type="time" value={recoveryTime} onChange={(e) => setRecoveryTime(e.target.value)}
                    className="bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
                </div>
              )}
              <label className="flex items-center justify-between py-2">
                <span className="text-sm text-champagne">Pengingat Latihan</span>
                <button onClick={() => setReminderLift(!reminderLift)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${reminderLift ? 'bg-gold' : 'bg-hairline'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-lacquer transition-transform ${reminderLift ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
              {reminderLift && (
                <div>
                  <label className="text-xs text-muted block mb-1">Hari latihan (1=Senin..7=Minggu, pisahkan koma)</label>
                  <input type="text" value={liftDays} onChange={(e) => setLiftDays(e.target.value)}
                    className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
                </div>
              )}
            </div>
          </OnboardingStep>
        )}

        {step === 4 && (
          <OnboardingStep title="Selesai!" description="Kamu siap memulai perjalanan powerlifting-mu">
            <p className="text-sm text-muted py-4">
              Semua data sudah tersimpan. Kamu bisa mengubah pengaturan kapan saja melalui menu Notifikasi dan Dashboard.
            </p>
          </OnboardingStep>
        )}

        <div className="flex justify-between mt-6 pt-4 border-t border-hairline">
          <button
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="px-4 py-2 border border-hairline text-muted text-sm hover:text-champagne disabled:opacity-30"
          >
            Kembali
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-2 bg-gold text-lacquer font-semibold text-sm hover:bg-gold-dim disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : step === totalSteps - 1 ? 'Selesai' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  )
}
