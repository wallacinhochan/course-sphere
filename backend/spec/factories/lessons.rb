FactoryBot.define do
  factory :lesson do
    title { Faker::Educator.course_name }
    status { 'draft' }
    video_url { nil }
    association :course
  end
end