class CreateExerciseSubcategories < ActiveRecord::Migration[5.0]
  def change
    create_table :exercise_subcategories do |t|
      t.string :name
      t.references :exercise_category
      t.timestamps
    end
  end
end
