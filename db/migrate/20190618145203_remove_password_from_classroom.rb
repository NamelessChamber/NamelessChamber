class RemovePasswordFromClassroom < ActiveRecord::Migration[5.0]
  def change
    remove_column :classrooms, :password, :string
  end
end
