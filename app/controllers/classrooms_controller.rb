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
      .joins('LEFT JOIN p_set_answers ON p_set_answers.p_set_id = p_sets.id')
      .select('p_set_answers.completed AS completed')
      .select('p_sets.id AS p_set_id, p_sets.name AS p_set_name')
      .select('classroom_psets.*')
      .order('created_at ASC')
      .to_a
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
