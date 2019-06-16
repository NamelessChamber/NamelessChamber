# == Schema Information
#
# Table name: classrooms
#
#  id         :integer          not null, primary key
#  course_id  :integer
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  password   :string
#

class Classroom < ApplicationRecord
  belongs_to :course
  has_many :classroom_users
  has_many :users, :through => :classroom_users
  has_many :classroom_psets
  has_many :p_sets, :through => :classroom_psets

  #scope :active, -> { where('start_date < ? AND end_date >= ?',
  #                          Date.today, Date.today) }
  #scope :inactive, -> { where('end_date < ?', Date.today) }
end
