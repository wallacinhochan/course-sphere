class Api::V1::Auth::RegistrationsController < Devise::RegistrationsController
  respond_to :json
  skip_before_action :authenticate_user!, raise: false

  def create
    user = User.new(
      name:                  params.dig(:user, :name),
      email:                 params.dig(:user, :email),
      password:              params.dig(:user, :password),
      password_confirmation: params.dig(:user, :password)
    )

    if user.save
      token = encode_jwt(user)
      render json: {
        user: { id: user.id, name: user.name, email: user.email },
        token: token,
        message: "Usuário criado com sucesso"
      }, status: :created
    else
      render json: { errors: user.errors.full_messages },
             status: :unprocessable_entity
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