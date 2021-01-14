# frozen_string_literal: true

class RegistrationKeyController < ApplicationController
  include RegistrationKeyHelper
  def create
    RegistrationKey.destroy_all if RegistrationKey.all.length.positive?
    alpha = ('A'..'Z').to_a.concat(('a'..'z').to_a)
    alpha_numeric = ('0'..'9').to_a.concat(alpha)
    key = (0...8).map { alpha_numeric[rand(62)] }.join
    RegistrationKey.create(key: key)
    redirect_to root_path
  end

  def show; end

  def check
    fields = params[:fields]
    key = fields[:key]
    if check_key(key)
      redirect_to new_user_registration_path
    else
      redirect_to registration_key_show_path
    end
  end
end
