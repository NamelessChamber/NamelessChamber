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

module Admin
  class ClassroomPsetsController < ApplicationController
    def create
      classroom_pset = ClassroomPset.create(
        params.require(:classroom_pset).permit(
          :p_set_id, :classroom_id
          # , :start_date, :end_date
        )
      )
      classroom = classroom_pset.classroom
      course = classroom.course

      redirect_to admin_course_classroom_path(course, classroom)
    end

    def destroy; end

    def show
      begin
        @classroom_pset = ClassroomPset.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        not_found
        return
      end

      @classroom = @classroom_pset.classroom
      @p_set = @classroom_pset.p_set
      @answers = @classroom_pset.answers
    end
  end
end
