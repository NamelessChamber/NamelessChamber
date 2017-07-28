class CreatePSetAnswers < ActiveRecord::Migration[5.0]
  def change
    create_table :p_set_answers do |t|
      t.references :p_set
      t.references :user
      t.json :data
      t.boolean :completed, default: false
      t.timestamps

      t.index [:p_set_id, :user_id], unique: true
    end
  end
end
