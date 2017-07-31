class AddPasswordToClassrooms < ActiveRecord::Migration[5.0]
  def change
    change_table :classrooms do |t|
      t.string :password
    end
  end
end
