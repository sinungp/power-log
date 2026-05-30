import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function HeroSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <section className="bg-lacquer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-6">
          <Link to="/" className="text-2xl font-display text-gold tracking-wide">
            PowerLog
          </Link>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="px-5 py-2 bg-gold text-lacquer rounded-sm font-semibold text-sm hover:bg-gold-dim"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-gold border border-gold rounded-sm text-sm hover:bg-gold hover:text-lacquer"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gold text-lacquer rounded-sm font-semibold text-sm hover:bg-gold-dim"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-light text-champagne mb-6">
            Track Your Powerlifting<br />Journey
          </h1>
          <p className="text-xl md:text-2xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one app for powerlifters. Calculate your 1RM, track SBD lifts,
            discover accessories, and optimize your warmup.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-gold text-lacquer rounded-sm font-bold text-lg hover:bg-gold-dim"
            >
              Start Free Trial
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
