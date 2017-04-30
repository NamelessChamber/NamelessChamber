class Admin::PSetsController < ApplicationController
  before_action :assert_course_admin!

  def new
    @p_set = PSet.new
    @exercise_categories = ExerciseCategory.order('name ASC')
  end

  def create
    p = params[:p_set].permit(:exercise_subcategory_id)
      .merge(user: current_user)
    p_set = PSet.create(p)

    redirect_to edit_admin_p_set_path(id: p_set.id)
  end

  def edit
  end
end
