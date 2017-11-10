require 'digest'

class PSetAudioUploader < CarrierWave::Uploader::Base
  def store_dir
    # "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    Rails.env.production? ?
      "p_set_audios" :
      "uploads/p_set_audios"
  end

  def filename
    digest = Digest::SHA256.hexdigest(file.read)
    "#{digest}.#{file.extension}"
  end
end
