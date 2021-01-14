# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'Factories' do
    context 'Valid factory' do
      subject { create(:user) }

      specify { is_expected.to be_valid }
    end

    context 'Invalid factory' do
      subject { build(:user, :invalid) }

      specify { is_expected.not_to be_valid }
    end
  end

  describe 'Associations' do
    it { is_expected.to have_many(:course_users) }
    it { is_expected.to have_many(:classroom_users) }
    it { is_expected.to have_many(:courses) }
    it { is_expected.to have_many(:classrooms) }
    it { is_expected.to have_many(:p_set_answers) }
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
