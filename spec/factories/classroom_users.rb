# frozen_string_literal: true

FactoryBot.define do
  factory :classroom_user do
    association :user
    association :classroom

    trait :invalid do
      user { nil }
      classroom { nil }
    end
  end
end
