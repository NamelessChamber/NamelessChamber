# == Schema Information
#
# Table name: registration_keys
#
#  id         :integer          not null, primary key
#  key        :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class RegistrationKey < ApplicationRecord
end
