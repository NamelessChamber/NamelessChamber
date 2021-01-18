# frozen_string_literal: true

class ClassroomsController < ApplicationController
  before_action :authenticate_user!

  def index
    @classrooms = current_user.classrooms.includes(:course)
  end

  def show
    @classroom = Classroom
                 .joins(:users)
                 .includes(:course)
                 .where(users: { id: current_user.id })
                 .where(id: params[:id])
                 .first!

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
                       .where('p_set_answers.completed' => true)
                       .where('p_set_answers.user_id' => current_user.id)
                       .pluck(:name)
  end

  # index for finding a class to join
  def registrar
    @classrooms = current_user.classrooms.includes(:course)
    enrolled_ids = @classrooms.map(&:id)
    @joinable_classrooms = Classroom.all
    @joinable_classrooms = @joinable_classrooms.where('id NOT IN (?)', enrolled_ids) unless enrolled_ids.empty?
  end

  # form for joining a class
  def register
    @classroom = Classroom.find(params[:classroom_id])
  end

  # post handler for joining a class
  def signup
    @classroom = Classroom.find(params[:classroom_id])

    @classroom.classroom_users.create!(user: current_user)
    redirect_to classroom_path(@classroom.id)
  end
end
