import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function HeroSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())

  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center py-6">
          <Link to="/" className="text-2xl font-bold">PowerLog</Link>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Track Your Powerlifting<br />Journey
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
            The all-in-one app for powerlifters. Calculate your 1RM, track SBD lifts,
            discover accessories, and optimize your warmup.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-100 shadow-xl"
            >
              Start Free Trial
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
