class AddStartEndDatesToClassrooms < ActiveRecord::Migration[5.0]
  def change
    change_table :classrooms do |t|
      t.date :start_date
      t.date :end_date
    end
  end
end
