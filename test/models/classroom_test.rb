# == Schema Information
#
# Table name: classrooms
#
#  id         :integer          not null, primary key
#  course_id  :integer
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  password   :string
#

require 'test_helper'

class ClassroomTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
