import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-lacquer">
      <Outlet />
      <Footer />
    </div>
  )
}
