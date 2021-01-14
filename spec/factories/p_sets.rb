# frozen_string_literal: true

FactoryBot.define do
  factory :p_set do
    association :user
    association :exercise_subcategory

    name { Faker::Lorem.word }
    data {}

    trait :invalid do
      name { nil }
    end
  end
end
