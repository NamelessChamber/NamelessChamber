# == Schema Information
#
# Table name: p_sets
#
#  id                         :integer          not null, primary key
#  name                       :string
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  user_id                    :integer
#  exercise_subcategory_id    :integer
#  exercise_subcategory_level :integer          default("1")
#  data                       :json
#

require 'test_helper'

class PSetTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
