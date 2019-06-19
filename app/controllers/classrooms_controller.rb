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
      .where(classroom: @classroom) #.where('start_date <= ? AND end_date >= ?', Date.today, Date.today)
      .joins(:p_set)
      .joins('LEFT JOIN p_set_answers ON p_set_answers.p_set_id = p_sets.id')
      .select('p_set_answers.completed AS completed')
      .select('p_sets.id AS p_set_id, p_sets.name AS p_set_name')
      .select('classroom_psets.*')
      .order('created_at ASC') #.order('end_date ASC')
      .to_a
  end
end
