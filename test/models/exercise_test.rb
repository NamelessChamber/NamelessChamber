# == Schema Information
#
# Table name: exercises
#
#  id         :integer          not null, primary key
#  data       :json
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  p_set_id   :integer
#  user_id    :integer
#

require 'test_helper'

class ExerciseTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
