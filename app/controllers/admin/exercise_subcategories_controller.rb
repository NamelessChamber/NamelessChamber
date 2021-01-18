# frozen_string_literal: true

module Admin
  class ExerciseSubcategoriesController < ApplicationController
    def new
      @exercise_subcategory = ExerciseSubcategory.new(
        exercise_category_id: params[:exercise_category_id]
      )
    end

    def create
      ExerciseSubcategory.create!(exercise_subcategory_params.merge(exercise_category_id: params[:exercise_category_id]))

      redirect_to admin_exercise_categories_path
    end

    def destroy
      @exercise_subcategory = ExerciseSubcategory.find(params[:id])
      @exercise_subcategory.destroy!

      redirect_to admin_exercise_categories_path
    end

    private

    def exercise_subcategory_params
      params.require(:exercise_subcategory).permit(:name)
    end
  end
end
