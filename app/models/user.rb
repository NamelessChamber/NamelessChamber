# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  firstname              :string
#  lastname               :string
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default("0"), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :inet
#  last_sign_in_ip        :inet
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  admin                  :boolean          default("false"), not null
#  student_id             :string           default(""), not null
#

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  has_many :course_users, dependent: :destroy
  has_many :classroom_users, dependent: :destroy
  has_many :courses, :through => :course_users
  has_many :classrooms, :through => :classroom_users
  has_many :p_set_answers, dependent: :destroy

  def whole_name
    "#{firstname} #{lastname}"
  end

  def student_id
    "#{student_id}"
  end
end
