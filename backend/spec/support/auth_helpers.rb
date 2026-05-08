module AuthHelpers
  def generate_token(user)
    payload = {
      sub: user.id.to_s,
      jti: SecureRandom.uuid,
      iat: Time.now.to_i,
      exp: 1.day.from_now.to_i
    }
    JWT.encode(payload, ENV['JWT_SECRET_KEY'], 'HS256')
  end

  def json
    JSON.parse(response.body)
  end
end