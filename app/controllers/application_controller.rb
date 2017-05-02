class ApplicationController < ActionController::Base
  # protect_from_forgery with: :exception
  protect_from_forgery unless: -> { request.format.json? }

  def not_found
    respond_to do |format|
      format.html { render :file => "#{Rails.root}/public/404", :layout => false, :status => :not_found }
      format.json { head :not_found }
      format.any  { head :not_found }
    end
  end

  def find_or_404(&block)
    begin
      block.call
    rescue ActiveRecord::RecordNotFound
      not_found
    end
  end

  def assert_course_admin!
    if current_user.nil? || current_user.courses.empty?
      redirect_to root_path
    end
  end
end
