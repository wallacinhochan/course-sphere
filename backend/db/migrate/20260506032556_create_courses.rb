class CreateCourses < ActiveRecord::Migration[8.1]
  def change
    create_table :courses do |t|
      t.string  :name,        null: false
      t.text    :description
      t.date    :start_date,  null: false
      t.date    :end_date,    null: false
      t.references :creator,  null: false, foreign_key: { to_table: :users }
      t.timestamps
    end
  end
end