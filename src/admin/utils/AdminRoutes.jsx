import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// eslint-disable-next-line react/prop-types
export default function AdminRoute ({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p>Loading...</p>

  if (user && (user.role === 'admin' || user.role === 'superadmin')) {
    return children
  }

  return <Navigate to='/appointments' replace />
}
