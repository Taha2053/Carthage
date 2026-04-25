import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'

interface Props {
  allowedRoles: Role[]
  children?: React.ReactNode
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const role = useAuthStore((s) => s.role)

  if (!role) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />

  return children ? <>{children}</> : <Outlet />
}
