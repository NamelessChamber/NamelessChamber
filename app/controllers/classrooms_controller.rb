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
      .first

    @classroom_psets = ClassroomPset
      .where('start_date < ? AND end_date >= ?', Date.today, Date.today)
      .where(classroom: @classroom)
      .joins(:p_set => :p_set_answers)
      .references(:p_set => :p_set_answers)
      .where(p_set_answers: {user_id: current_user.id})
      .select('p_set_answers.completed AS completed')
      .select('p_sets.id AS p_set_id, p_sets.name AS p_set_name')
      .select('classroom_psets.*')
      .order('end_date ASC')
      .to_a
  end
end
