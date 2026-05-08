require 'swagger_helper'

RSpec.describe 'Courses API', type: :request do
  path '/api/v1/courses' do
    get 'Lista cursos do usuário' do
      tags 'Courses'
      security [{ bearerAuth: [] }]
      produces 'application/json'

      response '200', 'cursos listados' do
        let(:user) { create(:user) }
        let(:Authorization) { "Bearer #{generate_token(user)}" }
        run_test!
      end

      response '401', 'não autenticado' do
        let(:Authorization) { 'Bearer token_invalido' }
        run_test!
      end
    end

    post 'Cria um curso' do
      tags 'Courses'
      security [{ bearerAuth: [] }]
      consumes 'application/json'
      produces 'application/json'

      parameter name: :course, in: :body, schema: {
        type: :object,
        properties: {
          course: {
            type: :object,
            properties: {
              name:        { type: :string, example: 'Ruby on Rails' },
              description: { type: :string, example: 'Curso completo' },
              start_date:  { type: :string, format: :date, example: '2026-01-01' },
              end_date:    { type: :string, format: :date, example: '2026-06-01' }
            },
            required: %w[name start_date end_date]
          }
        }
      }

      response '201', 'curso criado' do
        let(:user) { create(:user) }
        let(:Authorization) { "Bearer #{generate_token(user)}" }
        let(:course) { { course: { name: 'Novo Curso', start_date: Date.today, end_date: Date.today + 30 } } }
        run_test!
      end

      response '422', 'dados inválidos' do
        let(:user) { create(:user) }
        let(:Authorization) { "Bearer #{generate_token(user)}" }
        let(:course) { { course: { name: 'AB', start_date: Date.today, end_date: Date.today + 30 } } }
        run_test!
      end
    end
  end

  path '/api/v1/courses/{id}' do
    parameter name: :id, in: :path, type: :integer

    get 'Exibe um curso' do
      tags 'Courses'
      security [{ bearerAuth: [] }]
      produces 'application/json'

      response '200', 'curso encontrado' do
        let(:user) { create(:user) }
        let(:Authorization) { "Bearer #{generate_token(user)}" }
        let(:id) { create(:course, creator: user).id }
        run_test!
      end

      response '404', 'não encontrado' do
        let(:user) { create(:user) }
        let(:Authorization) { "Bearer #{generate_token(user)}" }
        let(:id) { 0 }
        run_test!
      end
    end

    delete 'Exclui um curso' do
      tags 'Courses'
      security [{ bearerAuth: [] }]

      response '204', 'curso excluído' do
        let(:user) { create(:user) }
        let(:Authorization) { "Bearer #{generate_token(user)}" }
        let(:id) { create(:course, creator: user).id }
        run_test!
      end

      response '403', 'não autorizado' do
        let(:user)  { create(:user) }
        let(:other) { create(:user) }
        let(:Authorization) { "Bearer #{generate_token(other)}" }
        let(:id) { create(:course, creator: user).id }
        run_test!
      end
    end
  end
end