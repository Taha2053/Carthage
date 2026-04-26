import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Index from './pages/Index'
import Login from './pages/Login'
import CentralDashboard from './pages/CentralDashboard'
import InstitutionPage from './pages/InstitutionPage'
import TeacherPage from './pages/TeacherPage'
import StudentPage from './pages/StudentPage'
import UploadPage from './pages/UploadPage'
import ReportsPage from './pages/ReportsPage'
import ForecastsPage from './pages/ForecastsPage'
import RankingsPage from './pages/RankingsPage'
import AlertsPage from './pages/AlertsPage'
import OrchestratorPage from './pages/OrchestratorPage'
import StrategicIntelligencePage from './pages/StrategicIntelligencePage'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import ChatWidget from './components/chat/ChatWidget'
import { Toaster } from 'react-hot-toast'

// New CRUD Pages
import AdminDepartments from './pages/admin/AdminDepartments'
import AdminStaff from './pages/admin/AdminStaff'
import AdminStudents from './pages/admin/AdminStudents'
import TeacherGrades from './pages/teacher/TeacherGrades'
import TeacherAbsences from './pages/teacher/TeacherAbsences'

export default function App() {
  const initSession = useAuthStore((s) => s.initSession)

  useEffect(() => {
    initSession()
  }, [initSession])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public — no auth required */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

        {/* Protected app routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin', 'enseignant', 'etudiant']} />
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
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin']}>
                  <InstitutionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'enseignant']}>
                  <TeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin', 'enseignant', 'etudiant']}>
                  <StudentPage />
                </ProtectedRoute>
              }
            />

            {/* ── Admin CRUD ── */}
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin']}>
                  <AdminDepartments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin']}>
                  <AdminStaff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin']}>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />

            {/* ── Teacher CRUD ── */}
            <Route
              path="/teacher/grades"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'enseignant']}>
                  <TeacherGrades />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/absences"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'enseignant']}>
                  <TeacherAbsences />
                </ProtectedRoute>
              }
            />

            {/* ── New AI / Data pages ── */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin']}>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecasts"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin']}>
                  <ForecastsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rankings"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin']}>
                  <RankingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedRoute allowedRoles={['ucar_central', 'institution_admin']}>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orchestrator"
              element={
                <ProtectedRoute allowedRoles={['ucar_central']}>
                  <OrchestratorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/strategy"
              element={
                <ProtectedRoute allowedRoles={['ucar_central']}>
                  <StrategicIntelligencePage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  )
}
