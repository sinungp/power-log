import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'ai'
  text: string
}

interface Props {
  mode: 'public' | 'dashboard'
  onSend: (message: string) => Promise<string>
  placeholder?: string
  title?: string
}

export default function FloatingChat({ mode, onSend, placeholder, title }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    mode === 'public'
      ? { role: 'ai', text: 'Halo! 👋 Ada yang bisa saya bantu tentang PowerLog? Tanya apa saja tentang fitur-fitur kami.' }
      : { role: 'ai', text: 'Halo! 💪 Saya siap bantu buat program latihan. Ceritakan apa yang kamu butuhkan!' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pos, setPos] = useState({ x: window.innerWidth - 88, y: window.innerHeight - 88 })
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [unread, setUnread] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setDragging(true)
    }
  }, [])

  useEffect(() => {
    if (!dragging) return
    const handleMouseMove = (e: MouseEvent) => {
      setPos({
        x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 56)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 56)),
      })
    }
    const handleMouseUp = () => setDragging(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, dragOffset])

  const handleSend = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const reply = await onSend(msg)
      setMessages((prev) => [...prev, { role: 'ai', text: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Maaf, terjadi kesalahan. Coba lagi nanti.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleOpen = () => {
    setOpen((prev) => {
      if (!prev) setUnread(0)
      return !prev
    })
  }

  return (
    <>
      <button
        ref={btnRef}
        onMouseDown={handleMouseDown}
        onClick={toggleOpen}
        className="fixed z-50 w-14 h-14 bg-gold hover:bg-gold-dim text-lacquer rounded-full flex items-center justify-center shadow-xl cursor-grab active:cursor-grabbing transition-colors"
        style={{ left: pos.x, top: pos.y }}
        aria-label="Chat"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>
            )}
          </>
        )}
      </button>

      {open && (
        <div
          className="fixed z-[60] w-[340px] sm:w-[380px] bg-raised border border-hairline shadow-2xl flex flex-col"
          style={{ left: Math.min(pos.x, window.innerWidth - 380), top: Math.max(20, pos.y - 420) }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-hovered">
            <h3 className="text-sm font-semibold text-champagne">{title || (mode === 'public' ? 'Tanya PowerLog' : 'AI Coach')}</h3>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-champagne">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] min-h-[200px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-gold text-lacquer rounded-lg rounded-br-sm'
                      : 'bg-lacquer text-body border border-hairline rounded-lg rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-lacquer border border-hairline px-3 py-2 rounded-lg rounded-bl-sm text-sm text-muted">
                  <span className="animate-pulse">Mengetik...</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-hairline p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || (mode === 'public' ? 'Tanya tentang PowerLog...' : 'Minta program latihan...')}
              className="flex-1 bg-lacquer border border-hairline px-3 py-2 text-sm text-champagne placeholder-muted outline-none focus:border-gold"
              maxLength={mode === 'public' ? 500 : 1000}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-gold text-lacquer disabled:opacity-40 hover:bg-gold-dim transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
