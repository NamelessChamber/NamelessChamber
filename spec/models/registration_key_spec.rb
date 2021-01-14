# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RegistrationKey, type: :model do
  describe 'Factories' do
    context 'Valid factory' do
      subject { create(:registration_key) }

      specify { is_expected.to be_valid }
    end

    context 'Invalid factory' do
      subject { build(:registration_key, :invalid) }

      specify { is_expected.not_to be_valid }
    end
  end

  describe 'Associations' do
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
