import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/app/dashboard" className="text-xl font-bold text-blue-600">
              PowerLog
            </Link>
            <div className="hidden md:flex gap-6">
              <Link to="/app/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
              <Link to="/app/calculator" className="text-gray-600 hover:text-blue-600">Calculator</Link>
              <Link to="/app/lifts" className="text-gray-600 hover:text-blue-600">Lifts</Link>
              <Link to="/app/accessories" className="text-gray-600 hover:text-blue-600">Accessories</Link>
              <Link to="/app/checklist" className="text-gray-600 hover:text-blue-600">Checklist</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {user?.plan}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
