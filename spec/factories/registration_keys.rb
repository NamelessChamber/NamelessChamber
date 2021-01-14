# frozen_string_literal: true

FactoryBot.define do
  factory :registration_key do
    key { Faker::Lorem.word }

    trait :invalid do
      key { nil }
    end
  end
end
