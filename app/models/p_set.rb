# == Schema Information
#
# Table name: p_sets
#
#  id         :integer          not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :integer
#

class PSet < ApplicationRecord
  belongs_to :user
end
