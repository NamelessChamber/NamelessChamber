# frozen_string_literal: true

module Admin
  class ClassroomsController < ApplicationController
    before_action :set_course
    before_action :authenticate_user!

    def remove_student
      @user_id = params[:user_id]
      @classroom_id = params[:classroom_id]
      @classroom_user = ClassroomUser.where(user_id: @user_id, classroom_id: @classroom_id)[0]
      @classroom_user.destroy!

      redirect_to admin_course_classroom_path(@course, @classroom_id)
    end

    def index
      @classrooms = @course.classrooms.order('created_at DESC')
      # .order('end_date DESC')
    end

    def new
      # confirm user is an admin of the course in precondition

      @classroom = Classroom.new(course: @course)
    end

    def show
      @classroom = Classroom.find(params[:id])
      @students = @classroom.users
      @classroom_psets = ClassroomPset
                         .includes(p_set: { exercise_subcategory: :exercise_category })
                         .where(classroom_id: @classroom.id)
                         .order('created_at DESC')
      # .order('end_date DESC')
    end

    def create
      classroom = Classroom.create!(classroom_params.merge(course: @course))
      redirect_to admin_course_classroom_path(@course, classroom)
    end

    def edit
      @classroom = Classroom.find(params[:id])
    end

    def destroy
      @classroom = Classroom.find(params[:id])
      @classroom.destroy!

      redirect_to admin_course_classrooms_path(@course.id)
    end

    def assign
      @exercise_categories = ExerciseCategory
                             .all
                             .includes(exercise_subcategories: :p_sets)
                             .group('exercise_categories.id')
                             .order('name ASC')

      @classroom = Classroom.find(params[:classroom_id])

      if params[:p_set_id]
        @p_set = PSet.find(params[:p_set_id])
        @classroom_pset = ClassroomPset.new(p_set: @p_set, classroom: @classroom)
      end
    end

    private

    def classroom_params
      params.require(:classroom).permit(:name)
    end

    def set_course
      @course = Course.find(params[:course_id])
    end
  end
end
