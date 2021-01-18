# frozen_string_literal: true

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
      ExerciseCategory.create!(exercise_category_params)

      redirect_to admin_exercise_categories_path
    end

    def destroy
      @exercise_category = ExerciseCategory.find(params[:id])
      @exercise_category.destroy!

      redirect_to admin_exercise_categories_path
    end

    private

    def exercise_category_params
      params.require(:exercise_category).permit(:name)
    end
  end
end
