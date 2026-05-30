import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Outlet />
      <Footer />
    </div>
  )
}
