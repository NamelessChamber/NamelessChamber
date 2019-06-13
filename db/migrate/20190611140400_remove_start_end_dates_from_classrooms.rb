class RemoveStartEndDatesFromClassrooms < ActiveRecord::Migration[5.0]
  def change
    remove_column :classrooms, :start_date, :date
    remove_column :classrooms, :end_date, :date
  end
end