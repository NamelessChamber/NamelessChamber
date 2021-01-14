# frozen_string_literal: true

class ClassroomPset < ApplicationRecord
  belongs_to :p_set
  belongs_to :classroom

  def answers
    student_ids = classroom.users.map(&:id)

    PSetAnswer
      .where(user_id: student_ids, p_set_id: p_set_id)
      .includes(:user)
      .order('users.firstname ASC')
  end
end
