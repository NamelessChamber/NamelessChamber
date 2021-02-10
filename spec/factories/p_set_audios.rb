# frozen_string_literal: true

FactoryBot.define do
  factory :p_set_audio do
    audio { Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/example.mp3'), 'audio/mp3') }
    name { Faker::Lorem.word }

    trait :invalid do
      audio { nil }
      name { nil }
    end
  end
end
