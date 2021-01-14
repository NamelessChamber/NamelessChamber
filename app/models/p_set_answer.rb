# frozen_string_literal: true

class PSetAnswer < ApplicationRecord
  belongs_to :user
  belongs_to :p_set
end
