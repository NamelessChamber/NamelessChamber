class RemoveStartEndDatesFromClassroomPsets < ActiveRecord::Migration[5.0]
  def change
    remove_column :classroom_psets, :start_date, :date
    remove_column :classroom_psets, :end_date, :date
  end
end
