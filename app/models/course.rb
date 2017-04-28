# == Schema Information
#
# Table name: courses
#
#  id         :integer          not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class Course < ApplicationRecord
  has_many :course_users
  has_many :users, :through => :course_users
  has_many :classrooms
end
