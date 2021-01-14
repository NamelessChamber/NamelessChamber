# frozen_string_literal: true

FactoryBot.define do
  factory :classroom_pset do
    association :p_set
    association :classroom

    trait :invalid do
      p_set { nil }
      classroom { nil }
    end
  end
end
