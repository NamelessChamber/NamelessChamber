# frozen_string_literal: true

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :course_users, dependent: :destroy
  has_many :classroom_users, dependent: :destroy
  has_many :courses, through: :course_users
  has_many :classrooms, through: :classroom_users
  has_many :p_set_answers, dependent: :destroy

  def whole_name
    "#{firstname} #{lastname}"
  end

  def studentID
    student_id.to_s
  end
end
