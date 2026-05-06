FactoryBot.define do
  factory :jwt_denylist do
    jti { "MyString" }
    exp { "2026-05-06 03:25:43" }
  end
end
