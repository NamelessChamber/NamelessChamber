# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClassroomUser, type: :model do
  describe 'Factories' do
    context 'Valid factory' do
      subject { create(:classroom_user) }

      specify { is_expected.to be_valid }
    end

    context 'Invalid factory' do
      subject { build(:classroom_user, :invalid) }

      specify { is_expected.not_to be_valid }
    end
  end

  describe 'Associations' do
    it { is_expected.to belong_to(:user) }
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
