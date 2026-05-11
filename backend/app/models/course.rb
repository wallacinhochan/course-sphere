class Course < ApplicationRecord
  belongs_to :creator, class_name: "User"
  has_many :lessons, dependent: :destroy

  validates :name, presence: true, length: { minimum: 3 }
  validates :start_date, presence: true
  validates :end_date,   presence: true
  validate  :end_date_after_start_date

  private

  def end_date_after_start_date
    return unless start_date && end_date
    if end_date < start_date
      errors.add(:end_date, "deve ser igual ou posterior à data de início")
    end
  end
end