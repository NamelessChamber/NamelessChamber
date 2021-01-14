# frozen_string_literal: true

class PSetAudioSerializer < ActiveModel::Serializer
  attributes :id, :name, :audio

  def audio
    object.audio.url
  end
end
