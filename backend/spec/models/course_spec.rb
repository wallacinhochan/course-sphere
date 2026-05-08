require 'rails_helper'

RSpec.describe Course, type: :model do
  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:start_date) }
  it { should validate_presence_of(:end_date) }
  it { should belong_to(:creator) }
  it { should have_many(:lessons) }

  it 'é inválido quando end_date < start_date' do
    course = build(:course, start_date: Date.today, end_date: Date.yesterday)
    expect(course).not_to be_valid
    expect(course.errors[:end_date]).to be_present
  end

  it 'é válido quando end_date == start_date' do
    course = build(:course, start_date: Date.today, end_date: Date.today)
    expect(course).to be_valid
  end
end