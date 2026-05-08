import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Data de início obrigatória'),
  end_date: z.string().min(1, 'Data de término obrigatória'),
}).refine(d => !d.end_date || !d.start_date || d.end_date >= d.start_date, {
  message: 'Data de término deve ser igual ou posterior à data de início',
  path: ['end_date']
})

export default function CourseForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [serverError, setServerError] = useState('')

  const { data: course } = useQuery({
    queryKey: ['course', id],
    queryFn: () => api.get(`/courses/${id}`).then(r => r.data),
    enabled: isEdit
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if (course) {
      reset({
        name: course.name,
        description: course.description || '',
        start_date: course.start_date,
        end_date: course.end_date,
      })
    }
  }, [course, reset])

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? api.patch(`/courses/${id}`, { course: data })
      : api.post('/courses', { course: data }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      navigate(isEdit ? `/courses/${id}` : `/courses/${res.data.id}`)
    },
    onError: (err) => {
      const messages = err.response?.data?.errors
      setServerError(messages ? messages.join(', ') : 'Erro ao salvar curso')
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to={isEdit ? `/courses/${id}` : '/'} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Voltar
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Editar curso' : 'Novo curso'}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Ex: React do Zero"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                {...register('description')}
                placeholder="Descreva o curso..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de início <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('start_date')}
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.start_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de término <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('end_date')}
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.end_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                {serverError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                {mutation.isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar curso'}
              </button>
              <Link
                to={isEdit ? `/courses/${id}` : '/'}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}