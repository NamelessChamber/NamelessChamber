class Admin::PSetsController < ApplicationController
  before_action :assert_course_admin!

  def show
    begin
      @p_set = PSet.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      head :not_found
      return
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

    redirect_to admin_p_set_options_path(p_set.id)
  end

  def edit
    begin
      @p_set = PSet.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      head :not_found
      return
    end

    @exercise_subcategory = ExerciseSubcategory
      .where(id: @p_set.exercise_subcategory_id)
      .includes(:exercise_category)
      .first
    @exercise_category = @exercise_subcategory.exercise_category
    @js_packs = ['admin/p_set']
  end

  def update
    begin
      @p_set = PSet.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      head :not_found
      return
    end

    fields = ['data', 'name']
    p_set = params[:p_set].to_unsafe_h.select { |k| fields.include?(k) }
    @p_set.update_attributes(p_set)

    respond_to do |format|
      format.json { render json: @p_set }
      format.html { redirect_to edit_admin_p_set_path(@p_set) }
    end
  end

  def destroy
    begin
      @p_set = PSet.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      head :not_found
      return
    end

    @p_set.destroy

    redirect_to admin_exercise_categories_path
  end

  def create_audio
    begin
      @p_set = PSet.find(params[:p_set_id])
    rescue ActiveRecord::RecordNotFound
      not_found
    end
    p_set_audio_params =
      params.require(:p_set_audio).permit(:audio, :name)
    p_set_audio = PSetAudio.find_or_create_by_file(p_set_audio_params)

    if p_set_audio.p_set_to_audio.where(p_set_id: @p_set.id).empty?
      PSetToAudio.create(
        p_set_id: params[:p_set_id],
        p_set_audio_id: p_set_audio.id
      )
    end

    redirect_to edit_admin_p_set_path(@p_set)
  end

  def destroy_audio
    p_set_to_audio = PSetToAudio.where(
      p_set_id: params[:p_set_id],
      p_set_audio_id: params[:p_set_audio_id]
    ).first

    unless p_set_to_audio.nil?
      p_set_to_audio.destroy
      p_set_audio = PSetAudio.find(params[:p_set_audio_id])
      if p_set_audio.p_sets.count == 0
        p_set_audio.destroy
      end
    end

    redirect_to edit_admin_p_set_path(@p_set)
  end

  def new_audio
    begin
      @p_set = PSet.find(params[:p_set_id])
    rescue ActiveRecord::RecordNotFound
      not_found
    end
  end
end
