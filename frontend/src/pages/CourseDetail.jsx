import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ConfirmModal from '../components/ConfirmModal'

const lessonSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  status: z.enum(['draft', 'published']),
  video_url: z.string().url('URL inválida').or(z.literal('')).optional(),
})

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [lessonError, setLessonError] = useState('')
  const [confirmModal, setConfirmModal] = useState(null)

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data)
  })

  const { data: randomUsers = [] } = useQuery({
    queryKey: ['randomusers'],
    queryFn: () =>
      fetch('https://randomuser.me/api/?results=5')
        .then(r => r.json())
        .then(d => d.results),
    staleTime: Infinity
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: { status: 'draft' }
  })

  const deleteCourse = useMutation({
    mutationFn: () => api.delete(`/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      navigate('/')
    }
  })

  const createLesson = useMutation({
    mutationFn: (data) => api.post(`/courses/${id}/lessons`, { lesson: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] })
      reset()
      setShowLessonForm(false)
      setLessonError('')
    },
    onError: (err) => {
      const messages = err.response?.data?.errors
      setLessonError(messages ? messages.join(', ') : 'Erro ao criar aula')
    }
  })

  const deleteLesson = useMutation({
    mutationFn: (lessonId) => api.delete(`/lessons/${lessonId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', id] })
  })

  const [editingLesson, setEditingLesson] = useState(null)

  const updateLesson = useMutation({
    mutationFn: ({ lessonId, data }) => api.patch(`/lessons/${lessonId}`, { lesson: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', id] })
      setEditingLesson(null)
    }
  })

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Carregando...</p>
    </div>
  )

  if (!course) return null

  const isOwner = course.creator_id === user?.id
  const lessons = course.lessons || []
  const filteredLessons = statusFilter === 'all'
    ? lessons
    : lessons.filter(l => l.status === statusFilter)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Voltar
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 flex-1 truncate">
            {course.name}
          </h1>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                to={`/courses/${id}/edit`}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Editar
              </Link>
              <button
                onClick={() => setConfirmModal({
                  message: 'O curso e todas as suas aulas serão excluídos permanentemente.',
                  onConfirm: () => { deleteCourse.mutate(); setConfirmModal(null) }
                })}
                className="text-sm px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Info do curso */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
              <span>
                📅 {new Date(course.start_date).toLocaleDateString('pt-BR')} →{' '}
                {new Date(course.end_date).toLocaleDateString('pt-BR')}
              </span>
              <span>📚 {lessons.length} aula{lessons.length !== 1 ? 's' : ''}</span>
              <span>👤 {isOwner ? 'Criado por você' : `Criado por ${course.creator?.name}`}</span>
            </div>
              {course.description && (
            <p className="text-gray-600 text-sm">{course.description}</p>
              )}
            </div>

        {/* Turma fictícia */}
        {randomUsers.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-medium text-gray-900 mb-4">Turma</h2>
            <div className="flex flex-wrap gap-4">
              {randomUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <img
                    src={u.picture.thumbnail}
                    alt={u.name.first}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-gray-600">
                    {u.name.first} {u.name.last}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aulas */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-900">Aulas</h2>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="published">Publicadas</option>
                <option value="draft">Rascunho</option>
              </select>
              {isOwner && (
                <button
                  onClick={() => setShowLessonForm(!showLessonForm)}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Aula
                </button>
              )}
            </div>
          </div>

          {/* Formulário nova aula */}
          {showLessonForm && (
            <form
              onSubmit={handleSubmit(d => createLesson.mutate(d))}
              className="border border-blue-100 bg-blue-50 rounded-xl p-4 mb-4 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input
                    {...register('title')}
                    placeholder="Título da aula"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <select
                    {...register('status')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicada</option>
                  </select>
                </div>
                <div>
                  <input
                    {...register('video_url')}
                    placeholder="URL do vídeo (opcional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  {errors.video_url && (
                    <p className="text-red-500 text-xs mt-1">{errors.video_url.message}</p>
                  )}
                </div>
              </div>
              {lessonError && (
                <p className="text-red-500 text-xs">{lessonError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createLesson.isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
                >
                  {createLesson.isPending ? 'Salvando...' : 'Salvar aula'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLessonForm(false); reset() }}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de aulas */}
          {filteredLessons.map((lesson, index) => (
  <div key={lesson.id} className="py-3 border-b border-gray-100 last:border-0">
    {editingLesson?.id === lesson.id ? (
      <div className="flex gap-2 items-center">
        <input
          defaultValue={lesson.title}
          onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          defaultValue={lesson.status}
          onChange={e => setEditingLesson({ ...editingLesson, status: e.target.value })}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
        >
          <option value="draft">Rascunho</option>
          <option value="published">Publicada</option>
        </select>
        <button
          onClick={() => updateLesson.mutate({ lessonId: lesson.id, data: editingLesson })}
          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
        >
          Salvar
        </button>
        <button
          onClick={() => setEditingLesson(null)}
          className="text-sm text-gray-500 px-2 py-1.5"
        >
          Cancelar
        </button>
      </div>
    ) : (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-5">{index + 1}</span>
          <div>
            <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
            {lesson.video_url && (
              <a href={lesson.video_url} target="_blank" rel="noreferrer"
                className="text-xs text-blue-500 hover:underline">
                Ver vídeo
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            lesson.status === 'published'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {lesson.status === 'published' ? 'Publicada' : 'Rascunho'}
          </span>
          {isOwner && (
            <>
              <button
                onClick={() => setEditingLesson({ id: lesson.id, title: lesson.title, status: lesson.status })}
                className="text-xs text-blue-400 hover:text-blue-600 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => setConfirmModal({
                  message: `A aula "${lesson.title}" será excluída permanentemente.`,
                  onConfirm: () => { deleteLesson.mutate(lesson.id); setConfirmModal(null) }
                })}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Excluir
              </button>
            </>
          )}
        </div>
      </div>
    )}
  </div>
))}
        </div>
      </main>
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  )
}