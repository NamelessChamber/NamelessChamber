# frozen_string_literal: true

class PSetSerializer < ActiveModel::Serializer
  attributes :id, :name, :created_at, :updated_at, :user_id,
             :exercise_subcategory_id, :exercise_subcategory_level, :data

  has_many :p_set_audios
end
