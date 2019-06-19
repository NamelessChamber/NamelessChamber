class Admin::CoursesController < ApplicationController
  before_action :assert_course_admin!

  def index
    @courses = Course
      .joins(:course_users)
      .where(course_users: {user_id: current_user.id})
  end

  def new
  end

  def create
	p =	params[:course].permit(:name)
	course = Course.create(p)
	# Janky way of creating a course_user
	# Need a way to do it in 1-2 lines, as above
	course_user = CourseUser.create
	course_user.user_id = current_user.id
	course_user.course_id = course.id
	course_user.save
	# Quarantined Code
	redirect_to admin_course_path(course)
  end

  def update
    begin
      @course = Course.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      not_found
      return
    end

    course_params = params.require(:course).permit(:name)
    @course.update_attributes(course_params)

    redirect_to edit_admin_course_path(@course)
  end

  def edit
    begin
      @course = Course.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      not_found
      return
    end
  end

  def show
    @course = Course.where(id: params[:id]).includes(:classrooms).first

    if @course.nil?
      not_found
    end
  end
end
