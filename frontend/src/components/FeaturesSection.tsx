const features = [
  {
    title: '1RM Calculator',
    description: 'Calculate your one-rep max using Epley, Brzycki, or Lombardi formulas. Get instant results.',
    icon: '🏋️',
  },
  {
    title: 'Lift Tracking',
    description: 'Log every squat, bench, and deadlift session. Track your personal records over time.',
    icon: '📊',
  },
  {
    title: 'Exercise Library',
    description: 'Discover accessory exercises tailored to your main lifts and skill level.',
    icon: '📚',
  },
  {
    title: 'Warmup & Cooldown',
    description: 'Follow structured warmup and cooldown checklists to optimize performance and recovery.',
    icon: '🔥',
  },
  {
    title: 'Progress Dashboard',
    description: 'See your monthly volume, latest PRs, and daily checklist status at a glance.',
    icon: '📈',
  },
  {
    title: 'Free & Pro Plans',
    description: 'Start with free essential tools. Upgrade to Pro for advanced analytics and more.',
    icon: '⭐',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Everything You Need</h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          PowerLog combines all the tools a powerlifter needs in one simple app.
        </p>
        <div className="grid md:grid-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
