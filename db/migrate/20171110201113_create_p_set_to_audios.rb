class CreatePSetToAudios < ActiveRecord::Migration[5.0]
  def change
    create_table :p_set_to_audios do |t|
      t.references :p_set
      t.references :p_set_audio
      t.timestamps
    end
    add_index :p_set_to_audios, [:p_set_id, :p_set_audio_id], unique: true
  end
end
