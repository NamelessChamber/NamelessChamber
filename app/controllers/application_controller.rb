# frozen_string_literal: true

class ApplicationController < ActionController::Base
  protect_from_forgery
  # protect_from_forgery unless: -> { request.format.json? }
  before_action :configure_permitted_parameters, if: :devise_controller?

  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[firstname lastname student_id])
  end

  def not_found
    respond_to do |format|
      format.html { render file: Rails.root.join('public/404.html'), layout: false, status: :not_found }
      format.json { head :not_found }
      format.any  { head :not_found }
    end
  end
end
