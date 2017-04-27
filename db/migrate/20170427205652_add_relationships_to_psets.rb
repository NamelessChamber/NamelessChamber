class AddRelationshipsToPsets < ActiveRecord::Migration[5.0]
  def change
    change_table :exercises do |t|
      t.references :p_set
      t.references :user
    end

    change_table :p_sets do |t|
      t.references :user
    end
  end
end
