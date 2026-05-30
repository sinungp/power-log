import { useInView } from '../hooks/useInView'

const features = [
  {
    title: '1RM Calculator',
    description: 'Calculate your one-rep max using Epley, Brzycki, or Lombardi formulas. Instant results.',
  },
  {
    title: 'Lift Tracking',
    description: 'Log every squat, bench, and deadlift session with weight, reps, and RPE.',
  },
  {
    title: 'Exercise Library',
    description: 'Discover accessory exercises tailored to your main lifts and skill level.',
  },
  {
    title: 'Warmup & Cooldown',
    description: 'Follow structured warmup and cooldown checklists for every session.',
  },
  {
    title: 'Goal Setting',
    description: 'Set SBD 1RM, body weight, or competition goals with auto progress tracking.',
  },
  {
    title: 'Recovery Logging',
    description: 'Track sleep, stress, and DOMS. Get a daily recovery score out of 100.',
  },
  {
    title: 'AI Recommendations',
    description: 'Rule-based and AI-powered training suggestions based on your actual data.',
  },
  {
    title: 'Notifications & Reminders',
    description: 'Get reminded to log lifts and recovery. Telegram push support.',
  },
  {
    title: 'Custom Dashboard',
    description: 'Toggle widgets: goal progress, recovery score, recommendations, and more.',
  },
  {
    title: 'Analytics & Charts',
    description: 'Visualize weekly volume, intensity zones, lift ratios, and body weight trends.',
  },
  {
    title: 'Onboarding Wizard',
    description: 'Personalized setup wizard tailors the app to your experience and goals.',
  },
  {
    title: 'OAuth2 Login',
    description: 'Sign in with Google, Facebook, or Twitter in one click.',
  },
]

export default function FeaturesSection() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="py-20 bg-lacquer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-3xl md:text-4xl text-center mb-4 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Everything You Need
        </h2>
        <p className={`text-muted text-center mb-12 max-w-xl mx-auto transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          PowerLog combines all the tools a powerlifter needs in one simple app.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`bg-raised p-6 border border-hairline hover:bg-hovered transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${150 + i * 100}ms` }}
            >
              <span className="block w-8 h-[2px] bg-gold mb-3" />
              <h3 className="text-lg font-semibold text-champagne mb-2">{f.title}</h3>
              <p className="text-body text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
