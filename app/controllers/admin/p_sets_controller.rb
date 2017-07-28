class Admin::PSetsController < ApplicationController
  before_action :assert_course_admin!

  def show
    find_or_404 do
      @p_set = PSet.find(params[:id])
    end

    respond_to do |format|
      format.json { render json: @p_set }
    end
  end

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

    p_set = params.require(:p_set).permit(:name, :data).to_h
    p_set[:data] = JSON(p_set[:data])
    @p_set.update_attributes(p_set)

    respond_to do |format|
      format.json { render json: @p_set }
      format.html { redirect_to edit_admin_p_set_path(@p_set) }
    end
  end
end
