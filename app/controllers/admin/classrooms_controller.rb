#"Nameless Chamber" - a music dictation web application.
#"Copyright 2020 Massachusetts Institute of Technology"

#This file is part of "Nameless Chamber"
    
#"Nameless Chamber" is free software: you can redistribute it and/or modify
#it under the terms of the GNU Affero General Public License as published by #the Free Software Foundation, either version 3 of the License, or
#(at your option) any later version.

#"Nameless Chamber" is distributed in the hope that it will be useful,
#but WITHOUT ANY WARRANTY; without even the implied warranty of
#MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#GNU Affero General Public License for more details.

#You should have received a copy of the GNU Affero General Public License
#along with "Nameless Chamber".  If not, see	<https://www.gnu.org/licenses/>.

#Contact Information: garo@mit.edu 
#Source Code: https://github.com/NamelessChamber/NamelessChamber




class Admin::ClassroomsController < ApplicationController
  before_action :find_course
  before_action :assert_course_admin!

	def remove_student
		@user_id, @classroom_id = params[:user_id], params[:classroom_id]
		@classroom_user = ClassroomUser.where(user_id: @user_id, classroom_id: @classroom_id)[0]
		@classroom_user.destroy
		redirect_to admin_course_classroom_path(@course, @classroom_id)
	end

  def index
    @classrooms = @course.classrooms.order('created_at DESC') 
	#.order('end_date DESC')
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
      .order('created_at DESC') 
	  #.order('end_date DESC')
  end

  def create
    p = params[:classroom].permit(
      :name
      ).merge(course: @course)
    classroom = Classroom.create(p)
    redirect_to admin_course_classroom_path(@course, classroom)
  end

  def edit
    find_or_404 do
      @classroom = Classroom.find(params[:id])
    end
  end

  def destroy
		@classroom = Classroom.find(params[:id])
		@classroom.destroy
		redirect_to admin_course_classrooms_path(@course.id)
  end

  def assign
    @exercise_categories = ExerciseCategory
      .all
      .includes(:exercise_subcategories => :p_sets)
      .group('exercise_categories.id')
      .order('name ASC')

    @classroom = Classroom.find(params[:classroom_id])

    unless params[:p_set_id].nil?
      @p_set = PSet.find(params[:p_set_id])
      @classroom_pset = ClassroomPset.new(p_set: @p_set, classroom: @classroom)
    end
  end

  private

  def find_course
    find_or_404 do
      @course = Course.find(params[:course_id])
    end
  end
end
