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
  class ExerciseCategoriesController < ApplicationController
    def index
      @exercise_categories = ExerciseCategory
                             .all
                             .includes(exercise_subcategories: :p_sets)
                             .group('exercise_categories.id')
                             .order('name ASC')
    end

    def new
      @exercise_category = ExerciseCategory.new
    end

    def create
      exercise_category = ExerciseCategory.create(
        params.require(:exercise_category).permit(:name)
      )

      redirect_to admin_exercise_categories_path
    end

    def destroy
      @exercise_category = ExerciseCategory.find(params[:id])
      @exercise_category.destroy
      redirect_to admin_exercise_categories_path
    end
  end
end
