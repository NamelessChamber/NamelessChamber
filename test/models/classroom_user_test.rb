# == Schema Information
#
# Table name: classroom_users
#
#  id           :integer          not null, primary key
#  user_id      :integer
#  classroom_id :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

require 'test_helper'

class ClassroomUserTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
