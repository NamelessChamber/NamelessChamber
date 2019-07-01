# == Schema Information
#
# Table name: exercise_subcategories
#
#  id                   :integer          not null, primary key
#  name                 :string
#  exercise_category_id :integer
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#

class ExerciseSubcategory < ApplicationRecord
  belongs_to :exercise_category
  has_many :p_sets, dependent: :destroy
end
