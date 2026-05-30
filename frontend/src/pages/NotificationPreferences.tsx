import { useState, useEffect } from 'react'
import { getNotificationPreferences, updateNotificationPreferences } from '../api/notificationApi'
import type { NotificationPreference } from '../types'

export default function NotificationPreferences() {
  const [pref, setPref] = useState<NotificationPreference>({
    reminder_recovery: true,
    reminder_recovery_time: '20:00:00',
    reminder_lift: true,
    reminder_lift_days: '1,3,5',
    telegram_chat_id: undefined,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getNotificationPreferences().then((res) => {
      if (res.data.data.reminder_recovery !== undefined) {
        setPref(res.data.data)
      }
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateNotificationPreferences(pref)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // ignore
    }
    setSaving(false)
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-light text-champagne">Preferensi Notifikasi</h1>
        <p className="text-muted text-sm">Atur pengingat latihan dan recovery</p>
      </div>

      <div className="bg-raised border border-hairline p-6 space-y-6">
        <div>
          <label className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm text-champagne">Pengingat Recovery</span>
              <p className="text-[11px] text-muted">Ingatkan kalau belum catat recovery harian</p>
            </div>
            <button onClick={() => setPref({ ...pref, reminder_recovery: !pref.reminder_recovery })}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${pref.reminder_recovery ? 'bg-gold' : 'bg-hairline'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-lacquer transition-transform ${pref.reminder_recovery ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
          {pref.reminder_recovery && (
            <div className="mt-2">
              <label className="text-xs text-muted block mb-1">Jam pengingat</label>
              <input type="time" value={pref.reminder_recovery_time?.slice(0, 5) || '20:00'}
                onChange={(e) => setPref({ ...pref, reminder_recovery_time: e.target.value + ':00' })}
                className="bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
            </div>
          )}
        </div>

        <div className="border-t border-hairline pt-4">
          <label className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm text-champagne">Pengingat Latihan</span>
              <p className="text-[11px] text-muted">Ingatkan kalau belum catat lift record hari ini</p>
            </div>
            <button onClick={() => setPref({ ...pref, reminder_lift: !pref.reminder_lift })}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${pref.reminder_lift ? 'bg-gold' : 'bg-hairline'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-lacquer transition-transform ${pref.reminder_lift ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
          {pref.reminder_lift && (
            <div className="mt-2">
              <label className="text-xs text-muted block mb-1">Hari latihan (1=Senin..7=Minggu, pisahkan koma)</label>
              <input type="text" value={pref.reminder_lift_days}
                onChange={(e) => setPref({ ...pref, reminder_lift_days: e.target.value })}
                className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
            </div>
          )}
        </div>

        <div className="border-t border-hairline pt-4">
          <label className="text-xs text-muted block mb-1">Telegram Chat ID (opsional)</label>
          <input type="text" value={pref.telegram_chat_id || ''}
            onChange={(e) => setPref({ ...pref, telegram_chat_id: e.target.value || undefined })}
            placeholder="Isi untuk notifikasi via Telegram"
            className="w-full bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne focus:border-gold outline-none" />
          <p className="text-[10px] text-muted mt-1">Kosongkan jika tidak pakai Telegram</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-gold text-lacquer font-semibold text-sm hover:bg-gold-dim disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : saved ? 'Tersimpan ✓' : 'Simpan Preferensi'}
        </button>
      </div>
    </div>
  )
}
