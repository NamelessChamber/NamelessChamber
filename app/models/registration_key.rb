# frozen_string_literal: true

class RegistrationKey < ApplicationRecord
    validates :key, presence: true
end
