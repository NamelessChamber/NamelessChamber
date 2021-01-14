# frozen_string_literal: true

FactoryBot.define do
  factory :p_set_to_audio do
    association :p_set
    association :p_set_audio

    trait :invalid do
      p_set { nil }
      p_set_audio { nil }
    end
  end
end
