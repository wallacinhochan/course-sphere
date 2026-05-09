import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuth } = useAuth()
  console.log('ProtectedRoute isAuth:', isAuth)
  if (!isAuth) return <Navigate to="/login" replace />
  return children
}