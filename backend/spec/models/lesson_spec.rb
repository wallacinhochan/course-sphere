require 'rails_helper'

RSpec.describe Lesson, type: :model do
  it { should validate_presence_of(:title) }
  it { should belong_to(:course) }

  it 'é inválido com status fora do enum' do
    lesson = build(:lesson, status: 'invalido')
    expect(lesson).not_to be_valid
  end

  it 'é inválido com video_url mal formatada' do
    lesson = build(:lesson, video_url: 'nao-é-url')
    expect(lesson).not_to be_valid
  end

  it 'é válido sem video_url' do
    lesson = build(:lesson, video_url: nil)
    expect(lesson).to be_valid
  end
end