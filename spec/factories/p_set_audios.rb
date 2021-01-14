# frozen_string_literal: true

FactoryBot.define do
  factory :p_set_audio do
    audio { Faker::Lorem.word }
    name { Faker::Lorem.word }

    trait :invalid do
      audio { nil }
      name { nil }
    end
  end
end
