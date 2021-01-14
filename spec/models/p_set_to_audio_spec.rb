# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PSetToAudio, type: :model do
  describe 'Factories' do
    context 'Valid factory' do
      subject { create(:p_set_to_audio) }

      specify { is_expected.to be_valid }
    end

    context 'Invalid factory' do
      subject { build(:p_set_to_audio, :invalid) }

      specify { is_expected.not_to be_valid }
    end
  end

  describe 'Associations' do
    it { is_expected.to belong_to(:p_set) }
    it { is_expected.to belong_to(:p_set_audio) }
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
