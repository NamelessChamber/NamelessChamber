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

class ApplicationController < ActionController::Base
  protect_from_forgery
  # protect_from_forgery unless: -> { request.format.json? }
  before_action :prefetch_admin_status
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[firstname lastname student_id])
  end

  def not_found
    respond_to do |format|
      format.html { render file: "#{Rails.root}/public/404", layout: false, status: :not_found }
      format.json { head :not_found }
      format.any  { head :not_found }
    end
  end

  def find_or_404
    yield
  rescue ActiveRecord::RecordNotFound
    not_found
  end

  def assert_course_admin!
    redirect_to root_path if current_user.nil?
  end

  def prefetch_admin_status
    unless current_user.nil?
      @current_user_is_admin = current_user.admin
      @current_user_is_enrolled = current_user.classrooms.count.positive?
    end
  end
end
