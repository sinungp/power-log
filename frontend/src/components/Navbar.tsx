import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const navLinks = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/calculator', label: 'Calculator' },
  { to: '/app/lifts', label: 'Lifts' },
  { to: '/app/accessories', label: 'Accessories' },
  { to: '/app/checklist', label: 'Checklist' },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
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
            <span className="text-sm text-muted">{user?.name}</span>
            <span className="px-2 py-0.5 text-xs font-medium border border-gold text-gold">
              {user?.plan}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-danger hover:text-danger"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
