# == Schema Information
#
# Table name: classroom_psets
#
#  id           :integer          not null, primary key
#  classroom_id :integer
#  p_set_id     :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

require 'test_helper'

class ClassroomPsetTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
