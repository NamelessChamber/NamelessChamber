# frozen_string_literal: true

module Admin
  class PSetsController < ApplicationController
    before_action :authenticate_user!

    def show
      @p_set = PSet.find(params[:id])

      respond_to do |format|
        format.json { render json: @p_set }
      end
    end

    def new
      @p_set = PSet.new
      @exercise_categories = ExerciseCategory.order('name ASC')
    end

    def create
      p_set = PSet.create!(p_set_params.merge(user: current_user))

      redirect_to admin_p_set_options_path(p_set.id)
    end

    def edit
      @p_set = PSet.find(params[:id])

      @exercise_subcategory = ExerciseSubcategory
                              .where(id: @p_set.exercise_subcategory_id)
                              .includes(:exercise_category)
                              .first!
      @exercise_category = @exercise_subcategory.exercise_category
    end

    def update
      @p_set = PSet.find(params[:id])

      @p_set.update!(params.require(:p_set).slice(:data, :name).permit!)

      respond_to do |format|
        format.json { render json: @p_set }
        format.html { redirect_to edit_admin_p_set_path(@p_set) }
      end
    end

    def destroy
      @p_set = PSet.find(params[:id])
      @p_set.destroy!

      redirect_to admin_exercise_categories_path
    end

    def create_audio
      @p_set = PSet.find(params[:p_set_id])

      filename = PSetAudioUploader.filename(p_set_audio_params[:audio])
      p_set_audio = PSetAudio.create_with(p_set_audio_params[:audio]).find_or_create_by(audio: filename)

      # TODO: use uniqueness validation
      if p_set_audio.p_set_to_audio.where(p_set_id: @p_set.id).empty?
        PSetToAudio.create(
          p_set_id: params[:p_set_id],
          p_set_audio_id: p_set_audio.id
        )
      end

      redirect_to admin_p_set_options_path(@p_set)
    end

    def destroy_audio
      @p_set = PSet.find(params[:p_set_id])

      p_set_to_audio = PSetToAudio.where(
        p_set_id: params[:p_set_id],
        p_set_audio_id: params[:p_set_audio_id]
      ).first

      unless p_set_to_audio.nil?
        p_set_to_audio.destroy!
        p_set_audio = PSetAudio.find(params[:p_set_audio_id])
        p_set_audio.destroy if p_set_audio.p_sets.count.zero?
      end

      respond_to do |format|
        format.html { redirect_to admin_p_set_options_path(@p_set) }
        format.json { render json: @p_set }
      end
    end

    def new_audio
      @p_set = PSet.find(params[:p_set_id])
    end

    private

    def p_set_audio_params
      params.require(:p_set_audio).permit(:audio, :name)
    end

    def p_set_params
      params.require(:p_set).permit(:exercise_subcategory_id)
    end
  end
end
