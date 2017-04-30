# == Schema Information
#
# Table name: classrooms
#
#  id         :integer          not null, primary key
#  course_id  :integer
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Classroom < ApplicationRecord
  belongs_to :course
  has_many :classroom_users
  has_many :users, :through => :classroom_users
end
