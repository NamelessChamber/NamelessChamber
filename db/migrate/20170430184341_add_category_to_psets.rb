class AddCategoryToPsets < ActiveRecord::Migration[5.0]
  def change
    change_table :p_sets do |t|
      t.references :exercise_subcategory
      t.integer :exercise_subcategory_level, default: 1
    end
  end
end
