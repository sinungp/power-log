import { useInView } from '../hooks/useInView'

const testimonials = [
  {
    name: 'Alex P.',
    role: 'Intermediate Powerlifter',
    text: 'PowerLog has completely changed how I track my progress. The 1RM calculator and PR tracking keep me motivated.',
    avatar: 'AP',
  },
  {
    name: 'Sarah M.',
    role: 'Personal Trainer',
    text: 'I recommend PowerLog to all my clients. The accessory recommendations and warmup checklists are game-changers.',
    avatar: 'SM',
  },
  {
    name: 'James R.',
    role: 'Beginner Lifter',
    text: 'Started powerlifting a month ago and PowerLog made it so easy to understand my numbers. Love it!',
    avatar: 'JR',
  },
]

export default function TestimonialsSection() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="py-20 bg-lacquer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-3xl md:text-4xl text-center mb-4 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          What Users Say
        </h2>
        <p className={`text-muted text-center mb-12 max-w-xl mx-auto transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Join thousands of powerlifters using PowerLog.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`bg-raised p-6 border border-hairline transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${250 + i * 150}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-gold text-lacquer flex items-center justify-center font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-champagne">{t.name}</div>
                  <div className="text-sm text-muted">{t.role}</div>
                </div>
              </div>
              <p className="text-body text-sm leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
