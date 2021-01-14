# frozen_string_literal: true

class ExerciseCategory < ApplicationRecord
  has_many :exercise_subcategories, dependent: :destroy
end
