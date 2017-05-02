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
    find_or_404 do
      @p_set = PSet.find(params[:id])
    end

    @exercise_subcategory = ExerciseSubcategory
      .where(id: @p_set.exercise_subcategory_id)
      .includes(:exercise_category)
      .first
    @exercise_category = @exercise_subcategory.exercise_category
    @js_packs = ['admin/p_set']
  end

  def update
    find_or_404 do
      @p_set = PSet.find(params[:id])
    end

    @p_set.update_attributes(params[:p_set].permit(
      :name
    ))

    redirect_to edit_admin_p_set_path(@p_set)
  end

  def show_data
    find_or_404 do
      @p_set = PSet.find(params[:p_set_id])
    end

    respond_to do |format|
      format.json { render json: @p_set.data }
    end
  end

  def update_data
    find_or_404 do
      @p_set = PSet.find(params[:p_set_id])
    end

    @p_set.update_attributes(params.permit(
      :data
    ))

    respond_to do |format|
      format.json { render json: @p_set.data }
    end
  end
end
