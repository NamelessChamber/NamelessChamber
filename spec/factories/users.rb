# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    firstname { Faker::Name.first_name }
    lastname { Faker::Name.last_name }
    email { Faker::Internet.unique.email }
    password { Faker::Internet.password }

    trait :invalid do
      firstname { nil }
      lastname { nil }
      email { nil }
      password { nil }
    end
  end
end
