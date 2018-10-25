class ClassroomsController < ApplicationController
  before_action :authenticate_user!

  def index
    @classrooms = current_user.classrooms.active.includes(:course)
    @old_classrooms = current_user.classrooms.inactive.includes(:course)
  end

  def show
    @classroom = Classroom
      .joins(:users)
      .includes(:course)
      .where(users: {id: current_user.id})
      .where(id: params[:id])
      .first

    @classroom_psets = ClassroomPset
      .where('start_date <= ? AND end_date >= ?', Date.today, Date.today)
      .where(classroom: @classroom)
      .joins(:p_set)
      .joins('LEFT JOIN p_set_answers ON p_set_answers.p_set_id = p_sets.id')
      .select('p_set_answers.completed AS completed')
      .select('p_sets.id AS p_set_id, p_sets.name AS p_set_name')
      .select('classroom_psets.*')
      .order('end_date ASC')
      .to_a
  end

  # index for finding a class to join
  def registrar
    @classrooms = current_user.classrooms.active.includes(:course)
    enrolled_ids = @classrooms.map(&:id)
    @joinable_classrooms = Classroom.active
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
    registration = params[:registration]
    if registration.nil? || registration[:password].nil?
      @error = 'Must provide a password'
      render 'register'
      return
    end

    if @classroom.password != registration[:password]
      @error = 'Invalid password'
      render 'register'
      return
    end

    # they've authenticated, create a classroom_user
    @classroom.classroom_users.create(user: current_user)
    redirect_to classroom_path(@classroom.id)
  end
end
