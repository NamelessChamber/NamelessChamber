class CoursesController < ApplicationController
  def index
    @breadcrumbs = [['courses', courses_path]]

    if user_signed_in?
      @admin_courses = Course
        .joins(:course_users)
        .where(course_users: {user_id: current_user.id})

      admin_ids = @admin_courses.map(&:id)

      @courses = Course.where.not(id: admin_ids)
    else
      @courses = Course.order('course_users.user_id ASC')
    end
  end

  def show
  end
end
