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
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          Start free. Upgrade when you need more.
        </p>
        <div className="grid md:grid-2 gap-8 max-w-3xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl p-8 border ${
                p.highlighted
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-105'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className={p.highlighted ? 'text-blue-200' : 'text-gray-400'}>{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-semibold ${
                  p.highlighted
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
