# frozen_string_literal: true

class PSet < ApplicationRecord
  belongs_to :user
  belongs_to :exercise_subcategory
  has_many :classroom_psets, dependent: :destroy
  has_many :classrooms, through: :classroom_psets
  has_many :p_set_answers # TODO: Should we delete answers?
  has_many :p_set_to_audio, dependent: :destroy
  has_many :p_set_audios, through: :p_set_to_audio
end
