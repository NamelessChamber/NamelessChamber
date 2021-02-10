# frozen_string_literal: true

module Admin
  class CoursesController < ApplicationController
    before_action :authenticate_user!

    def index
      @courses = Course
                 .joins(:course_users)
                 .where(course_users: { user_id: current_user.id })
    end

    def new; end

    def destroy
      @course = Course.find(params[:id])
      @course.destroy!

      redirect_to admin_courses_url
    end

    def create
      # TODO: wrap in a transaction
      course = Course.create!(course_params)
      CourseUser.create!(user: current_user, course: course)

      redirect_to admin_course_path(course)
    end

    def update
      @course = Course.find(params[:id])
      @course.update!(course_params)

      redirect_to edit_admin_course_path(@course)
    end

    def edit
      @course = Course.find(params[:id])
    end

    def show
      @course = Course.where(id: params[:id]).includes(:classrooms).first!
    end

    private

    def course_params
      params.require(:course).permit(:name)
    end
  end
end
