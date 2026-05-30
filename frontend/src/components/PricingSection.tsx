import { useInView } from '../hooks/useInView'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '1RM Calculator',
      'Basic lift tracking (up to 50 entries)',
      'Accessory exercise library',
      'Warmup & cooldown checklists',
      'Basic dashboard',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    features: [
      'Unlimited lift tracking',
      'Advanced analytics & charts',
      'Export data to CSV',
      'Custom checklist templates',
      'Priority support',
      'No ads',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
]

export default function PricingSection() {
  const { ref, inView } = useInView()

  return (
    <section ref={ref} className="py-20 bg-lacquer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-3xl md:text-4xl text-center mb-4 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Simple Pricing
        </h2>
        <p className={`text-muted text-center mb-12 max-w-xl mx-auto transition-all duration-700 delay-100 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Start free. Upgrade when you need more.
        </p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p, i) => (
            <div
              key={p.name}
              className={`p-8 border transition-all duration-500 ${
                p.highlighted
                  ? 'bg-raised border-gold'
                  : 'bg-raised border-hairline'
              } ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${300 + i * 200}ms` }}
            >
              <h3 className="text-2xl font-bold text-champagne mb-2">{p.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-champagne">{p.price}</span>
                <span className="text-muted">{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-body">
                    <span className="text-gold">&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-sm font-semibold text-sm transition-all duration-300 ${
                  p.highlighted
                    ? 'bg-gold text-lacquer hover:bg-gold-dim'
                    : 'border border-gold text-gold hover:bg-gold hover:text-lacquer'
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
