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
# Table name: p_set_audios
#
#  id         :integer          not null, primary key
#  audio      :string
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class PSetAudio < ApplicationRecord
  mount_uploader :audio, PSetAudioUploader
  has_many :p_set_to_audio
  has_many :p_sets, :through => :p_set_to_audio

  def self.find_or_create_by_file(params)
    filename = PSetAudioUploader.filename(params[:audio])
    p_set_audio = PSetAudio.where(audio: filename).first

    if p_set_audio.nil?
      p_set_audio = PSetAudio.create(params)
    end

    p_set_audio
  end
end
