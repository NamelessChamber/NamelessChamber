class AddRelationshipsToPsets < ActiveRecord::Migration[5.0]
  def change
    change_table :p_sets do |t|
      t.references :user
    end
  end
end
