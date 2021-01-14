# frozen_string_literal: true

FactoryBot.define do
  factory :course_user do
    association :user
    association :course

    trait :invalid do
      user { nil }
      course { nil }
    end
  end
end
