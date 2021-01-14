# frozen_string_literal: true

FactoryBot.define do
  factory :p_set_answer do
    association :user
    association :p_set

    completed { false }
    data {}

    trait :invalid do
      user { nil }
      p_set { nil }
    end
  end
end
