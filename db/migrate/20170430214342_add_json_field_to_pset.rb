class AddJsonFieldToPset < ActiveRecord::Migration[5.0]
  def change
    change_table :p_sets do |t|
      t.json :data
    end
  end
end
