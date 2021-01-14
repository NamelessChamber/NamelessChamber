# frozen_string_literal: true

module Admin
  class ClassroomPsetsController < ApplicationController
    def create
      classroom_pset = ClassroomPset.create(
        params.require(:classroom_pset).permit(
          :p_set_id, :classroom_id
          # , :start_date, :end_date
        )
      )
      classroom = classroom_pset.classroom
      course = classroom.course

      redirect_to admin_course_classroom_path(course, classroom)
    end

    def destroy; end

    def show
      begin
        @classroom_pset = ClassroomPset.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        not_found
        return
      end

      @classroom = @classroom_pset.classroom
      @p_set = @classroom_pset.p_set
      @answers = @classroom_pset.answers
    end
  end
end
