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

class ClassroomUser < ApplicationRecord
end
