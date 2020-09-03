#"Nameless Chamber" - a music dictation web application.
#"Copyright 2020 Massachusetts Institute of Technology"

#This file is part of "Nameless Chamber"
    
#"Nameless Chamber" is free software: you can redistribute it and/or modify
#it under the terms of the GNU Affero General Public License as published by #the Free Software Foundation, either version 3 of the License, or
#(at your option) any later version.

#"Nameless Chamber" is distributed in the hope that it will be useful,
#but WITHOUT ANY WARRANTY; without even the implied warranty of
#MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#GNU Affero General Public License for more details.

#You should have received a copy of the GNU Affero General Public License
#along with "Nameless Chamber".  If not, see	<https://www.gnu.org/licenses/>.

#Contact Information: garo@mit.edu 
#Source Code: https://github.com/NamelessChamber/NamelessChamber


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
  has_many :classroom_users, dependent: :destroy
  has_many :users, :through => :classroom_users
  has_many :classroom_psets, dependent: :destroy
  has_many :p_sets, :through => :classroom_psets

  #scope :active, -> { where('start_date < ? AND end_date >= ?',
  #                          Date.today, Date.today) }
  #scope :inactive, -> { where('end_date < ?', Date.today) }
end
