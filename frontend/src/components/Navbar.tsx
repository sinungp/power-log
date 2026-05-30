import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import NotificationBell from './NotificationBell'

const navLinks = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/analytics', label: 'Analytics' },
  { to: '/app/lifts', label: 'Lifts' },
  { to: '/app/goals', label: 'Goals' },
  { to: '/app/recommendations', label: 'Rekom' },
  { to: '/app/body-weight', label: 'Weight' },
  { to: '/app/recovery', label: 'Recovery' },
  { to: '/app/calculator', label: 'Calc' },
  { to: '/app/accessories', label: 'Accessories' },
  { to: '/app/checklist', label: 'Checklist' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-raised border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-8">
            <Link to="/app/dashboard" className="text-xl font-display text-gold tracking-wide">
              PowerLog
            </Link>
            <div className="hidden md:flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm ${
                    location.pathname === link.to
                      ? 'text-gold'
                      : 'text-muted hover:text-gold'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-gold border border-hairline hover:border-gold"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <span className="hidden sm:inline text-sm text-muted">{user?.name}</span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium border border-gold text-gold">
              {user?.plan}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-danger hover:text-danger"
            >
              Logout
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-muted hover:text-gold border border-hairline hover:border-gold"
              aria-label="Toggle menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <path d="M6 6l12 12M18 6l-12 12"/>
                  </>
                ) : (
                  <>
                    <path d="M3 6h18M3 12h18M3 18h18"/>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-hairline bg-raised">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 text-sm rounded-sm ${
                  location.pathname === link.to
                    ? 'bg-gold/10 text-gold'
                    : 'text-muted hover:bg-hovered hover:text-champagne'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-hairline pt-2 mt-2 sm:hidden">
              <span className="block px-3 py-1 text-xs text-muted">{user?.name} · {user?.plan}</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
