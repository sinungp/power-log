import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

export default function HeroSection() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { theme, toggle } = useThemeStore()

  return (
    <section className="bg-lacquer min-h-[90vh] flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <nav className="flex justify-between items-center py-6">
          <Link to="/" className="text-2xl font-display text-gold tracking-wide">
            PowerLog
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="http://localhost:8081/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-gold text-sm transition-colors"
            >
              Docs
            </a>
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-gold border border-hairline hover:border-gold"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
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
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-light text-champagne mb-6 animate-fade-in-up">
          Track Your Powerlifting<br />Journey
        </h1>
        <p className="text-xl md:text-2xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animate-delay-100">
          The all-in-one app for powerlifters. Track SBD lifts, calculate 1RM,
          set goals, get AI recommendations, monitor recovery, and more.
        </p>

        {/* Barbell SVG */}
        <div className="mb-10 animate-fade-in-up animate-delay-200">
          <svg width="320" height="80" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
            {/* left outer plate */}
            <rect x="36" y="14" width="16" height="52" rx="3" fill="oklch(84% 0.19 80.46)" className="plate-left-outer" />
            {/* left inner plate */}
            <rect x="56" y="18" width="14" height="44" rx="2" fill="oklch(84% 0.19 80.46)" className="plate-left-inner" />
            {/* right inner plate */}
            <rect x="250" y="18" width="14" height="44" rx="2" fill="oklch(84% 0.19 80.46)" className="plate-right-inner" />
            {/* right outer plate */}
            <rect x="268" y="14" width="16" height="52" rx="3" fill="oklch(84% 0.19 80.46)" className="plate-right-outer" />
            {/* bar */}
            <rect x="20" y="34" width="280" height="12" rx="2" fill="oklch(45% 0.005 95)" className="bar-shaft" />
            {/* left collar */}
            <rect x="74" y="30" width="6" height="20" rx="1" fill="oklch(35% 0.005 95)" className="bar-shaft" />
            {/* right collar */}
            <rect x="240" y="30" width="6" height="20" rx="1" fill="oklch(35% 0.005 95)" className="bar-shaft" />
          </svg>
        </div>

        {!isAuthenticated && (
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-gold text-lacquer rounded-sm font-bold text-lg hover:bg-gold-dim animate-fade-in-up animate-delay-300"
          >
            Start Free Trial
          </Link>
        )}

        {/* SBD pill badges */}
        <div className="flex gap-3 mt-12 animate-fade-in-up animate-delay-400">
          {['Squat', 'Bench', 'Deadlift'].map((lift) => (
            <span
              key={lift}
              className="px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold border border-gold/40 rounded-sm"
            >
              {lift}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
