class Api::V1::Auth::SessionsController < Devise::SessionsController
  respond_to :json
  skip_before_action :authenticate_user!, raise: false
  skip_before_action :verify_signed_out_user, raise: false

  def create
    user = User.find_by(email: params.dig(:user, :email))

    if user&.valid_password?(params.dig(:user, :password))
      token = encode_jwt(user)
      render json: {
        user: { id: user.id, name: user.name, email: user.email },
        token: token,
        message: "Login realizado com sucesso"
      }, status: :ok
    else
      render json: { error: "Email ou senha inválidos" }, status: :unauthorized
    end
  end

  private

  def encode_jwt(user)
    payload = {
      sub: user.id.to_s,
      jti: SecureRandom.uuid,
      iat: Time.now.to_i,
      exp: 1.day.from_now.to_i
    }
    JWT.encode(payload, ENV["JWT_SECRET_KEY"], "HS256")
  end
end