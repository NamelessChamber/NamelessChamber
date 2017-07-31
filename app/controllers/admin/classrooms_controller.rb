class Admin::ClassroomsController < ApplicationController
  before_action :find_course
  before_action :assert_course_admin!

  def index
    @classrooms = @course.classrooms.order('end_date DESC')
  end

  def new
    # confirm user is an admin of the course in precondition

    @classroom = Classroom.new(course: @course)
  end

  def show
    @classroom = Classroom.find(params[:id])
    @students = @classroom.users
    @classroom_psets = ClassroomPset
      .includes(:p_set => {:exercise_subcategory => :exercise_category})
      .where(classroom_id: @classroom.id)
      .order('end_date DESC')
  end

  def create
    p = params[:classroom].permit(
      :name, :start_date, :end_date
      ).merge(course: @course)
    classroom = Classroom.create(p)
    redirect_to admin_course_classroom_path(@course, classroom)
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
