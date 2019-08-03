class AddStudentIdToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :student_id, :string, :default => "", :null => false, :length => {:minimum => 9, :maximum => 9}
  end
end
