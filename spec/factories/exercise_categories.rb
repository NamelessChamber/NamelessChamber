# frozen_string_literal: true

FactoryBot.define do
  factory :exercise_category do
    name { Faker::Lorem.word }

    trait :invalid do
      name { nil }
    end
  end
end
