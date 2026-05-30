const steps = [
  {
    step: '01',
    title: 'Create Account',
    desc: 'Sign up for free in seconds. No credit card required.',
  },
  {
    step: '02',
    title: 'Log Your Lifts',
    desc: 'Record your squat, bench, and deadlift sessions with weight, reps, and RPE.',
  },
  {
    step: '03',
    title: 'Track Progress',
    desc: 'Monitor your PRs, analyze trends, and see your improvement over time.',
  },
  {
    step: '04',
    title: 'Optimize Training',
    desc: 'Use 1RM calculator, accessory recommendations, and checklists to level up.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          Get started in just a few simple steps.
        </p>
        <div className="grid md:grid-4 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
