import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function AppLayout() {
  return (
    <div className="min-h-full bg-lacquer selection:bg-gold/30 selection:text-gold">
      <Navbar />
      <main className="w-full h-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="animate-fade-in-scale">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
