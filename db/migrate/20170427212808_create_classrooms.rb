class CreateClassrooms < ActiveRecord::Migration[5.0]
  def change
    create_table :classrooms do |t|
      t.references :course
      t.string :name
      t.timestamps
    end
  end
end
