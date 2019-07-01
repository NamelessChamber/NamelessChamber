class Admin::ExerciseCategoriesController < ApplicationController
  def index
    @exercise_categories = ExerciseCategory
      .all
      .includes(:exercise_subcategories => :p_sets)
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
