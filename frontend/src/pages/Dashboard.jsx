import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { Skeleton } from '../components/Skeleton'
import { Spinner } from '../components/Spinner'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { showToast } = useToast()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['courses', page],
    queryFn: () => api.get(`/courses?page=${page}`).then(r => r.data),
    keepPreviousData: true
  })

  const courses = data?.courses || []
  const meta = data?.meta || {}

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleLogout = () => {
    logout()
    showToast('Até logo!', 'info')
    setTimeout(() => { window.location.href = '/login' }, 800)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-lg font-semibold text-white tracking-tight">CourseSphere</h1>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm text-blue-100 truncate max-w-[160px] sm:max-w-none">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-blue-100 hover:text-white transition-colors whitespace-nowrap"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Meus cursos</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {meta.total || 0} curso{meta.total !== 1 ? 's' : ''} no total
            </p>
          </div>
          <Link
            to="/courses/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Novo curso
          </Link>
        </div>

        <input
          type="text"
          placeholder="Buscar cursos..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

            {isLoading ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-5 space-y-3"
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />

            <div className="flex justify-between pt-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    ) : isError ? (
      <div className="text-center py-16">
        <p className="text-red-400 text-sm">
          Erro ao carregar cursos. Verifique sua conexão.
        </p>
      </div>
    ) : filtered.length === 0 ? (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4">
          <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium mb-1">
          {search ? 'Nenhum curso encontrado' : 'Nenhum curso ainda'}
        </p>
        <p className="text-gray-400 text-sm mb-5">
          {search
            ? `Nenhum resultado para "${search}"`
            : 'Crie seu primeiro curso e comece a organizar suas aulas'}
        </p>
        {!search && (
          <Link
            to="/courses/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Criar primeiro curso
          </Link>
        )}
      </div>
    ) : (
          <>
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
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <div className="flex gap-2">
                      <span>{new Date(course.start_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      <span>→</span>
                      <span>{new Date(course.end_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                    {course.lessons_count > 0 && (
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {course.lessons_count} aula{course.lessons_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Paginação */}
            {meta.total_pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página {page} de {meta.total_pages}
                </span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === meta.total_pages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}