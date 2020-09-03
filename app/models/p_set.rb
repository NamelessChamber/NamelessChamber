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
# Table name: p_sets
#
#  id                         :integer          not null, primary key
#  name                       :string
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  user_id                    :integer
#  exercise_subcategory_id    :integer
#  exercise_subcategory_level :integer          default("1")
#  data                       :json
#

class PSet < ApplicationRecord
  belongs_to :user
  belongs_to :exercise_subcategory
  has_many :classroom_psets, :dependent => :destroy
  has_many :classrooms, :through => :classroom_psets
  has_many :p_set_answers # TODO: Should we delete answers?
  has_many :p_set_to_audio, dependent: :destroy
  has_many :p_set_audios, :through => :p_set_to_audio

  serialize :data, JSON
end
