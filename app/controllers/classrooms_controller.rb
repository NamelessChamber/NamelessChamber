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




class ClassroomsController < ApplicationController
  before_action :authenticate_user!

  def index
    @classrooms = current_user.classrooms.includes(:course)
    #@old_classrooms = current_user.classrooms.includes(:course)
  end

  def show
    @classroom = Classroom
      .joins(:users)
      .includes(:course)
      .where(users: {id: current_user.id})
      .where(id: params[:id])
      .first

    @classroom_psets = ClassroomPset
      .where(classroom: @classroom)
      .joins(:p_set)
      .select('p_sets.id AS p_set_id, p_sets.name AS p_set_name')
      .select('classroom_psets.*')
      .order('created_at ASC')
      .to_a

		@student_answers = ClassroomPset
			.where(classroom: @classroom)
			.joins(p_set: [:p_set_answers])
			.where("p_set_answers.completed" => true)
			.where("p_set_answers.user_id" => current_user.id)
			.pluck(:name)
  end

  # index for finding a class to join
  def registrar
    @classrooms = current_user.classrooms.includes(:course)
    enrolled_ids = @classrooms.map(&:id)
    @joinable_classrooms = Classroom.all
    if !enrolled_ids.empty?
      @joinable_classrooms = @joinable_classrooms.where('id NOT IN (?)', enrolled_ids)
    end
  end

  # form for joining a class
  def register
    @classroom = Classroom.find(params[:classroom_id])
    if @classroom.nil?
      not_found
      return
    end
  end

  # post handler for joining a class
  def signup
    @classroom = Classroom.find(params[:classroom_id])
    if @classroom.nil?
      not_found
      return
    end

    @classroom.classroom_users.create(user: current_user)
    redirect_to classroom_path(@classroom.id)
  end
end
