class Admin::ClassroomPsetsController < ApplicationController
  def create
    classroom_pset = ClassroomPset.create(
      params.require(:classroom_pset).permit(
        :p_set_id, :classroom_id, :start_date, :end_date
      )
    )
    classroom = classroom_pset.classroom
    course = classroom.course

    redirect_to admin_course_classroom_path(course, classroom)
  end

  def destroy
  end
end
