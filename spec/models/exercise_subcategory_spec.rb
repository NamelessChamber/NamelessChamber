# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ExerciseSubcategory, type: :model do
  describe 'Factories' do
    context 'Valid factory' do
      subject { create(:exercise_subcategory) }

      specify { is_expected.to be_valid }
    end

    context 'Invalid factory' do
      subject { build(:exercise_subcategory, :invalid) }

      specify { is_expected.not_to be_valid }
    end
  end

  describe 'Associations' do
    it { is_expected.to belong_to(:exercise_category) }
    it { is_expected.to have_many(:p_sets) }
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
