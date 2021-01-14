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

class RegistrationKeyController < ApplicationController
  include RegistrationKeyHelper
  def create
    RegistrationKey.destroy_all if RegistrationKey.all.length.positive?
    alpha = ('A'..'Z').to_a.concat(('a'..'z').to_a)
    alpha_numeric = ('0'..'9').to_a.concat(alpha)
    key = (0...8).map { alpha_numeric[rand(62)] }.join
    RegistrationKey.create(key: key)
    redirect_to root_path
  end

  def show; end

  def check
    fields = params[:fields]
    key = fields[:key]
    if check_key(key)
      redirect_to new_user_registration_path
    else
      redirect_to registration_key_show_path
    end
  end
end
