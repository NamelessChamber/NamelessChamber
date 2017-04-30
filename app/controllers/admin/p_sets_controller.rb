class Admin::PSetsController < ApplicationController
  before_action :assert_course_admin!

  def new
    @p_set = PSet.new
    @exercise_categories = ExerciseCategory.order('name ASC')
  end

  def created
  end
end
