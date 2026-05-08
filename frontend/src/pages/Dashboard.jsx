import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data)
  })

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">CourseSphere</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Meus cursos</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {courses.length} curso{courses.length !== 1 ? 's' : ''} no total
            </p>
          </div>
          <Link
            to="/courses/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Novo curso
          </Link>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar cursos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            Carregando cursos...
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-red-400 text-sm">Erro ao carregar cursos. Verifique sua conexão.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">
              {search ? 'Nenhum curso encontrado.' : 'Você ainda não tem cursos.'}
            </p>
            {!search && (
              <Link
                to="/courses/new"
                className="mt-3 inline-block text-blue-600 text-sm hover:underline"
              >
                Criar primeiro curso
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(course => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {course.name}
                </h3>
                {course.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <div className="flex gap-3 text-xs text-gray-400 mt-auto">
                  <span>
                    {new Date(course.start_date).toLocaleDateString('pt-BR')}
                  </span>
                  <span>→</span>
                  <span>
                    {new Date(course.end_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}