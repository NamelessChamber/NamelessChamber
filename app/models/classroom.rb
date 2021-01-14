# frozen_string_literal: true

class Classroom < ApplicationRecord
  belongs_to :course
  has_many :classroom_users, dependent: :destroy
  has_many :users, through: :classroom_users
  has_many :classroom_psets, dependent: :destroy
  has_many :p_sets, through: :classroom_psets

  # scope :active, -> { where('start_date < ? AND end_date >= ?',
  #                          Date.today, Date.today) }
  # scope :inactive, -> { where('end_date < ?', Date.today) }
end
