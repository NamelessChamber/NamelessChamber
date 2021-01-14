# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PSet, type: :model do
  describe 'Factories' do
    context 'Valid factory' do
      subject { create(:p_set) }

      specify { is_expected.to be_valid }
    end

    context 'Invalid factory' do
      subject { build(:p_set, :invalid) }

      specify { is_expected.not_to be_valid }
    end
  end

  describe 'Associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:exercise_subcategory) }
    it { is_expected.to have_many(:classroom_psets) }
    it { is_expected.to have_many(:classrooms) }
    it { is_expected.to have_many(:p_set_answers) }
    it { is_expected.to have_many(:p_set_to_audio) }
    it { is_expected.to have_many(:p_set_audios) }
  end

  describe 'Validations' do
  end

  describe 'Callbacks' do
  end

  describe 'ClassMethods' do
  end

  describe 'InstanceMethods' do
  end
end
