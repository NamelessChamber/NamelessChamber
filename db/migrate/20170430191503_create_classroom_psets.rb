class CreateClassroomPsets < ActiveRecord::Migration[5.0]
  def change
    create_table :classroom_psets do |t|
      t.references :classroom
      t.references :p_set
      t.date :start_date
      t.date :end_date
      t.timestamps
    end
  end
end
