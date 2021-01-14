# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Course, type: :model do
  describe 'Factories' do
    context 'Valid factory' do
      subject { create(:course) }

      specify { is_expected.to be_valid }
    end

    context 'Invalid factory' do
      subject { build(:course, :invalid) }

      specify { is_expected.not_to be_valid }
    end
  end

  describe 'Associations' do
    it { is_expected.to have_many(:course_users) }
    it { is_expected.to have_many(:users).through(:course_users) }
    it { is_expected.to have_many(:classrooms) }
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
