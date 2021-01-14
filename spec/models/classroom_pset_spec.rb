# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClassroomPset, type: :model do
  describe 'Factories' do
    context 'Valid factory' do
      subject { create(:classroom_pset) }

      specify { is_expected.to be_valid }
    end

    context 'Invalid factory' do
      subject { build(:classroom_pset, :invalid) }

      specify { is_expected.not_to be_valid }
    end
  end

  describe 'Associations' do
    it { is_expected.to belong_to(:p_set) }
    it { is_expected.to belong_to(:classroom) }
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
