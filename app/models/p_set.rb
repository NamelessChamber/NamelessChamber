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
#  data                       :json
#

class PSet < ApplicationRecord
  belongs_to :user
  belongs_to :exercise_subcategory
  has_many :classroom_psets
  has_many :classrooms, :through => :classroom_psets

  before_create :add_default_metadata

  def initialize_pairs(items)
    items.map { |item| [item, false] }
  end

  def add_default_metadata
    self.data ||= {
      solfege: initialize_pairs([
        'd', 'r', 'm', 'f', 's', 'l', 't', 'di', 'ri', 'fi', 'si', 'li', 'ra',
        'meh', 'seh', 'leh', 'teh'
      ]),
      rhythm: initialize_pairs([
        '1', '1/2', '1/4', '1/8', '1/16', '1/32',
        '1r', '1/2r', '1/4r', '1/8r', '1/16r', '1/32r'
      ]),
      harmony: initialize_pairs([
        '1', '1/2', '1/4', '1/8', '1/16', '1/32',
        '1r', '1/2r', '1/4r', '1/8r', '1/16r', '1/32r'
      ]),
      inversion: initialize_pairs([
        '1', '1/2', '1/4', '1/8', '1/16', '1/32',
        '1r', '1/2r', '1/4r', '1/8r', '1/16r', '1/32r'
      ]),
      accidental: initialize_pairs([
        'C', 'D', 'E', 'F', 'G', 'A', 'B',
        'Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb',
        'C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#',
      ]),
      meter: {top: 4, bottom: 4},
      staves: [],
      measures: 1,
      pick_up_beat: 1
    }
  end
end
