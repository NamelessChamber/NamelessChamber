# == Schema Information
#
# Table name: p_set_answers
#
#  id         :integer          not null, primary key
#  p_set_id   :integer
#  user_id    :integer
#  data       :json
#  completed  :boolean          default("false")
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'test_helper'

class PSetAnswerTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
