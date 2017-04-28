class CreateClassroomUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :classroom_users do |t|
      t.references :user
      t.references :classroom
      t.timestamps
    end
  end
end
