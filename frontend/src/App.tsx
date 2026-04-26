import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Index from './pages/Index'
import Login from './pages/Login'
import CentralDashboard from './pages/CentralDashboard'
import InstitutionPage from './pages/InstitutionPage'
import TeacherPage from './pages/TeacherPage'
import StudentPage from './pages/StudentPage'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Index />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Protected app routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={['ucar_central', 'institution_admin', 'enseignant', 'etudiant']}
            />
          }
        >
          <Route element={<AppLayout />}>
            <Route
              path="/central"
              element={
                <ProtectedRoute allowedRoles={['ucar_central']}>
                  <CentralDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution/:id"
              element={
                <ProtectedRoute allowedRoles={['institution_admin']}>
                  <InstitutionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['enseignant']}>
                  <TeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['etudiant']}>
                  <StudentPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
