# frozen_string_literal: true

# "Nameless Chamber" - a music dictation web application.
# "Copyright 2020 Massachusetts Institute of Technology"

# This file is part of "Nameless Chamber"

# "Nameless Chamber" is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by #the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# "Nameless Chamber" is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with "Nameless Chamber".  If not, see	<https://www.gnu.org/licenses/>.

# Contact Information: garo@mit.edu
# Source Code: https://github.com/NamelessChamber/NamelessChamber

require 'digest'

class PSetAudioUploader < CarrierWave::Uploader::Base
  def self.store_dir
    # "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    if Rails.env.production?
      'p_set_audios'
    else
      'uploads/p_set_audios'
    end
  end

  def store_dir
    PSetAudioUploader.store_dir
  end

  def filename
    digest = Digest::SHA256.hexdigest(file.read)
    "#{digest}.#{file.extension}"
  end

  def self.render_path(file)
    "#{store_dir}/#{filename(file)}"
  end

  def self.filename(file)
    digest = Digest::SHA256.hexdigest(file.read)
    file.rewind
    "#{digest}#{File.extname(file.path)}"
  end
end
