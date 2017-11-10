# == Schema Information
#
# Table name: p_set_to_audios
#
#  id             :integer          not null, primary key
#  p_set_id       :integer
#  p_set_audio_id :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

require 'test_helper'

class PSetToAudioTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
