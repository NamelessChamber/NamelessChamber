require 'digest'

class PSetAudioUploader < CarrierWave::Uploader::Base
  def self.store_dir
    # "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    Rails.env.production? ?
      "p_set_audios" :
      "uploads/p_set_audios"
  end

  def store_dir
    PSetAudioUploader.store_dir
  end

  def filename
    digest = Digest::SHA256.hexdigest(file.read)
    "#{digest}.#{file.extension}"
  end

  def self.render_path(file)
    "#{store_dir}/#{filename(file)}"
  end

  private

  def self.filename(file)
    digest = Digest::SHA256.hexdigest(file.read)
    file.rewind
    "#{digest}#{File.extname(file.path)}"
  end
end
