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
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What Users Say</h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
          Join thousands of powerlifters using PowerLog.
        </p>
        <div className="grid md:grid-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.role}</div>
                </div>
              </div>
              <p className="text-gray-600 text-sm italic">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
