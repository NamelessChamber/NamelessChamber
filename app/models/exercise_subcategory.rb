# frozen_string_literal: true

class ExerciseSubcategory < ApplicationRecord
  belongs_to :exercise_category
  has_many :p_sets, dependent: :destroy
end
