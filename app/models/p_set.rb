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

  serialize :data, JSON

  def initialize_pairs(items)
    items.map { |item| [item, false] }
  end

  def add_default_metadata
    self.data ||= {
      solfege: initialize_pairs([
        'do', 're', 'mi', 'fa', 'so', 'la', 'ti',
        'di', 'ri', 'fi', 'si', 'li', 'ra',
        'meh', 'seh', 'leh', 'teh'
      ]),
      rhythm: initialize_pairs([
        '1', '2', '4', '8', '16', '32',
        '1r', '2r', '4r', '8r', '16r', '32r'
      ]),
      harmony: initialize_pairs([
        'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viio',
        'vio', 'i', 'II', 'iio', 'III', 'III+', 'iv',
        'v', 'VI', 'VII', 'VII+', 'N6', 'Gr+6', 'Fr+6',
        'It+6', 'V/V', 'V/ii', 'V/iii', 'V/vi', 'V/IV',
        'V/viio', 'viioi/ii', 'viioi/iii'
      ]),
      inversion: initialize_pairs([
        '6', '6/4', '4/3', '4/2', '6/3', '6/5', '7'
      ]),
      meter: {top: 4, bottom: 4},
      staves: [],
      measures: 1,
      pick_up_beat: 1
    }
  end
end
