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
end
