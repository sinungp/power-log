const features = [
  {
    title: '1RM Calculator',
    description: 'Calculate your one-rep max using Epley, Brzycki, or Lombardi formulas. Get instant results.',
  },
  {
    title: 'Lift Tracking',
    description: 'Log every squat, bench, and deadlift session. Track your personal records over time.',
  },
  {
    title: 'Exercise Library',
    description: 'Discover accessory exercises tailored to your main lifts and skill level.',
  },
  {
    title: 'Warmup & Cooldown',
    description: 'Follow structured warmup and cooldown checklists to optimize performance and recovery.',
  },
  {
    title: 'Progress Dashboard',
    description: 'See your monthly volume, latest PRs, and daily checklist status at a glance.',
  },
  {
    title: 'Free & Pro Plans',
    description: 'Start with free essential tools. Upgrade to Pro for advanced analytics and more.',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-lacquer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl text-center mb-4">Everything You Need</h2>
        <p className="text-muted text-center mb-12 max-w-xl mx-auto">
          PowerLog combines all the tools a powerlifter needs in one simple app.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-raised p-6 border border-hairline hover:bg-hovered transition-colors">
              <span className="block w-6 h-[2px] bg-gold mb-3" />
              <h3 className="text-lg font-semibold text-champagne mb-2">{f.title}</h3>
              <p className="text-body text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
