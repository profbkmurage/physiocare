import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// eslint-disable-next-line react/prop-types
export default function PrivateRoute ({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p>Loading...</p>

  return user ? children : <Navigate to='/login' replace />
}
