require 'rails_helper'

RSpec.describe 'Courses', type: :request do
  let!(:user) { create(:user) }
  let!(:other_user) { create(:user) }
  let!(:course) { create(:course, creator: user) }
  let(:token) { generate_token(user) }
  let(:other_token) { generate_token(other_user) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }
  let(:other_headers) { { 'Authorization' => "Bearer #{other_token}" } }

  describe 'GET /api/v1/courses' do
    it 'retorna lista de cursos' do
      get '/api/v1/courses', headers: headers
      expect(response).to have_http_status(:ok)
      expect(json['courses']).to be_an(Array)
    end

    it 'retorna 401 sem token' do
      get '/api/v1/courses'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/courses' do
    it 'cria curso com dados válidos' do
      post '/api/v1/courses', params: {
        course: { name: 'Novo Curso', start_date: Date.today, end_date: Date.today + 30 }
      }, headers: headers, as: :json

      expect(response).to have_http_status(:created)
      expect(json['name']).to eq('Novo Curso')
    end

    it 'retorna erro com nome curto' do
      post '/api/v1/courses', params: {
        course: { name: 'AB', start_date: Date.today, end_date: Date.today + 30 }
      }, headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'DELETE /api/v1/courses/:id' do
    it 'permite ao criador excluir' do
      delete "/api/v1/courses/#{course.id}", headers: headers
      expect(response).to have_http_status(:no_content)
    end

    it 'retorna 403 para não criador' do
      delete "/api/v1/courses/#{course.id}", headers: other_headers
      expect(response).to have_http_status(:forbidden)
    end
  end
end