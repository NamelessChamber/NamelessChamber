# frozen_string_literal: true

module Admin
  class ClassroomPsetsController < ApplicationController
    def create
      classroom_pset = ClassroomPset.create!(classroom_params)
      @classroom = classroom_pset.classroom
      @course = @classroom.course

      redirect_to admin_course_classroom_path(@course, @classroom)
    end

    def destroy; end

    def show
      @classroom_pset = ClassroomPset.find(params[:id])

      @classroom = @classroom_pset.classroom
      @p_set = @classroom_pset.p_set
      @answers = @classroom_pset.answers
    end

    private

    def classroom_params
      params.require(:classroom_pset).permit(:p_set_id, :classroom_id)
    end
  end
end
