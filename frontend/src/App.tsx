import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingLayout from './layouts/LandingLayout'
import AppLayout from './layouts/AppLayout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import OAuthCallback from './pages/OAuthCallback'
import Dashboard from './pages/Dashboard'
import Calculator from './pages/Calculator'
import LiftRecord from './pages/LiftRecord'
import AccessoryPage from './pages/Accessory'
import ChecklistPage from './pages/Checklist'
import BodyWeightPage from './pages/BodyWeight'
import RecoveryPage from './pages/Recovery'
import AnalyticsPage from './pages/Analytics'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="calculator" element={<Calculator />} />
            <Route path="lifts" element={<LiftRecord />} />
            <Route path="accessories" element={<AccessoryPage />} />
            <Route path="checklist" element={<ChecklistPage />} />
            <Route path="body-weight" element={<BodyWeightPage />} />
            <Route path="recovery" element={<RecoveryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
