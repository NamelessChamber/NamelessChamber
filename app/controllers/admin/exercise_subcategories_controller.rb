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




class Admin::ExerciseSubcategoriesController < ApplicationController
  def new
    @exercise_subcategory = ExerciseSubcategory.new(
      exercise_category_id: params[:exercise_category_id]
    )
  end

  def create
    exercise_subcategory = ExerciseSubcategory.create(
      params.require(:exercise_subcategory)
        .permit(:name)
        .merge(exercise_category_id: params[:exercise_category_id])
    )

    redirect_to admin_exercise_categories_path
  end

	def destroy
		@exercise_subcategory = ExerciseSubcategory.find(params[:id])
		@exercise_subcategory.destroy
		redirect_to admin_exercise_categories_path
	end
end
