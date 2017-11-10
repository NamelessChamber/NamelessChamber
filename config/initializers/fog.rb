require 'fog/aws'
require 'carrierwave'
require 'carrierwave/storage/fog'
require 'carrierwave/orm/activerecord'

if Rails.env.production?
  CarrierWave.configure do |config|
    config.storage = :fog
    config.fog_provider = 'fog/aws'
    config.fog_credentials = {
      provider: 'AWS',
      aws_access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY']
    }
    config.fog_directory = 'namelesschamber'
  end
else
  CarrierWave.configure do |config|
    config.storage = :file
  end
end
