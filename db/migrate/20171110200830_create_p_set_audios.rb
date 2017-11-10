class CreatePSetAudios < ActiveRecord::Migration[5.0]
  def change
    create_table :p_set_audios do |t|
      t.string :audio
      t.string :name
      t.timestamps
    end
  end
end
