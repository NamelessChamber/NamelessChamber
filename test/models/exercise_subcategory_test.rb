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

require 'test_helper'

class ExerciseSubcategoryTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
