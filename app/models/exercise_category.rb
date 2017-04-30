# == Schema Information
#
# Table name: exercise_categories
#
#  id         :integer          not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class ExerciseCategory < ApplicationRecord
  has_many :exercise_subcategories
end
