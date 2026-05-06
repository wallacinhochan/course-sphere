class ApplicationController < ActionController::API
  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "Registro não encontrado" }, status: :not_found
  end

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last
    return render json: { error: "Token não fornecido" }, status: :unauthorized unless token

    begin
      payload = JWT.decode(token, ENV["JWT_SECRET_KEY"], true, algorithm: "HS256").first
      @current_user = User.find(payload["sub"])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render json: { error: "Token inválido ou expirado" }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end