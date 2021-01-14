# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Classroom, type: :model do
  describe 'Factories' do
    context 'Valid factory' do
      subject { create(:classroom) }

      specify { is_expected.to be_valid }
    end

    context 'Invalid factory' do
      subject { build(:classroom, :invalid) }

      specify { is_expected.not_to be_valid }
    end
  end

  describe 'Associations' do
    it { is_expected.to have_many(:classroom_users) }
    it { is_expected.to have_many(:users).through(:classroom_users) }
    it { is_expected.to have_many(:classroom_psets) }
    it { is_expected.to have_many(:p_sets).through(:classroom_psets) }
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
