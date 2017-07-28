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

class PSetAnswer < ApplicationRecord
  belongs_to :user
  belongs_to :p_set
  
  serialize :data, JSON
end
