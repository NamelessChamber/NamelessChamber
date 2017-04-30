class Admin::ClassroomsController < ApplicationController
  before_action :find_course
  before_action :assert_course_admin!

  def new
    # confirm user is an admin of the course in precondition

    @classroom = Classroom.new(course: @course)
  end

  def create
    p = params[:classroom].permit(
      :name, :start_date, :end_date
      ).merge(course: @course)
    classroom = Classroom.create(p)
    redirect_to edit_admin_course_classroom_path(classroom)
  end

  def edit
    find_or_404 do
      @classroom = Classroom.find(params[:id])
    end
  end

  private

  def find_course
    find_or_404 do
      @course = Course.find(params[:course_id])
    end
  end
end
