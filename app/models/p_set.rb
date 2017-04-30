# == Schema Information
#
# Table name: p_sets
#
#  id                         :integer          not null, primary key
#  name                       :string
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  user_id                    :integer
#  exercise_subcategory_id    :integer
#  exercise_subcategory_level :integer          default("1")
#

class PSet < ApplicationRecord
  belongs_to :user
  belongs_to :exercise_subcategory
  has_many :classroom_psets
  has_many :classrooms, :through => :classroom_psets
end
