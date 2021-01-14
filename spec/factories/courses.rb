# frozen_string_literal: true

FactoryBot.define do
  factory :course do
    name { Faker::Lorem.word }

    trait :invalid do
      name { nil }
    end
  end
end
