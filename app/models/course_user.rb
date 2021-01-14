# frozen_string_literal: true

class CourseUser < ApplicationRecord
  belongs_to :user
  belongs_to :course
end
