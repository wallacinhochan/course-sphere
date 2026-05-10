require 'rails_helper'

RSpec.describe 'Auth', type: :request do
  describe 'POST /api/v1/auth/register' do
    it 'cria usuário e retorna token' do
      post '/api/v1/auth/register', params: {
        user: { name: 'Teste', email: 'novo@test.com', password: '123456' }
      }, as: :json

      expect(response).to have_http_status(:created)
      expect(json['token']).to be_present
      expect(json['user']['email']).to eq('novo@test.com')
    end

    it 'retorna erro com email duplicado' do
      create(:user, email: 'duplicado@test.com')
      post '/api/v1/auth/register', params: {
        user: { name: 'Teste', email: 'duplicado@test.com', password: '123456' }
      }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(json['errors']).to be_present
    end
  end

  describe 'POST /api/v1/auth/sign_in' do
    let!(:user) { create(:user, email: 'login@test.com', password: '123456') }

    it 'retorna token com credenciais corretas' do
      post '/api/v1/auth/sign_in', params: {
        user: { email: 'login@test.com', password: '123456' }
      }, as: :json

      expect(response).to have_http_status(:ok)
      expect(json['token']).to be_present
    end

    it 'retorna 401 com senha errada' do
      post '/api/v1/auth/sign_in', params: {
        user: { email: 'login@test.com', password: 'errada' }
      }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end
  end
end