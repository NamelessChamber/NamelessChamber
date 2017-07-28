# == Schema Information
#
# Table name: classroom_psets
#
#  id           :integer          not null, primary key
#  classroom_id :integer
#  p_set_id     :integer
#  start_date   :date
#  end_date     :date
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

class ClassroomPset < ApplicationRecord
  belongs_to :p_set
  belongs_to :classroom
end
