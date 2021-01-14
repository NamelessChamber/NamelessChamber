# frozen_string_literal: true

FactoryBot.define do
  factory :exercise_subcategory do
    association :exercise_category

    name { Faker::Lorem.word }

    trait :invalid do
      name { nil }
    end
  end
end
