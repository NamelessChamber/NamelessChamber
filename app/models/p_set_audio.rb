# frozen_string_literal: true

class PSetAudio < ApplicationRecord
  mount_uploader :audio, PSetAudioUploader
  has_many :p_set_to_audio
  has_many :p_sets, through: :p_set_to_audio

  validates :name, presence: true
end
