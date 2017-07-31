class Admin::ExerciseCategoriesController < ApplicationController
  def index
    @exercise_categories = ExerciseCategory
      .all
      .includes(:exercise_subcategories => :p_sets)
      .group('exercise_categories.id')
      .order('name ASC')

    puts @exercise_categories.inspect
  end

  def new
    @exercise_category = ExerciseCategory.new
  end

  def create
    exercise_category = ExerciseCategory.create(
      params.require(:exercise_category).permit(:name)
    )

    redirect_to admin_p_exercise_categories_path
  end
end
