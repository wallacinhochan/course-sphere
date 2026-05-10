import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CourseDetail from './pages/CourseDetail'
import CourseForm from './pages/CourseForm'

export const router = createBrowserRouter([
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  {
    path: '/courses/new',
    element: <ProtectedRoute><CourseForm /></ProtectedRoute>
  },
  {
    path: '/courses/:id',
    element: <ProtectedRoute><CourseDetail /></ProtectedRoute>
  },
  {
    path: '/courses/:id/edit',
    element: <ProtectedRoute><CourseForm /></ProtectedRoute>
  },
])