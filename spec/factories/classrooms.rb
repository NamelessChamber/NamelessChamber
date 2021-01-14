# frozen_string_literal: true

FactoryBot.define do
  factory :classroom do
    association :course

    name { Faker::Lorem.word }

    trait :invalid do
      name { nil }
    end
  end
end
