require 'rails_helper'

RSpec.describe User, type: :model do
  subject {create(:user)}
  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:email) }
  it { should validate_uniqueness_of(:email).case_insensitive }
  it { should have_many(:created_courses) }

  it 'é inválido com email mal formatado' do
    user = build(:user, email: 'nao-é-email')
    expect(user).not_to be_valid
  end
end