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

class Exercise < ApplicationRecord
  belongs_to :p_set
  belongs_to :user
end
