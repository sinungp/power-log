import { useRef, useState, useEffect, type RefObject } from 'react'

export function useInView(options?: IntersectionObserverInit): { ref: RefObject<HTMLElement | null>; inView: boolean } {
  const ref = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, ...options },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}
