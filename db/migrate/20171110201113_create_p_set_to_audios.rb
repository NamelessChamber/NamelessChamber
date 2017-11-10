class CreatePSetToAudios < ActiveRecord::Migration[5.0]
  def change
    create_table :p_set_to_audios do |t|
      t.references :p_set
      t.references :p_set_audio
      t.timestamps
    end
  end
end
