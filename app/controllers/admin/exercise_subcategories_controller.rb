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
