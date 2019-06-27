class Admin::UsersController < ApplicationController
	before_action :assert_course_admin!

	def show
		@users = User.where(admin: false)
	end

	def destroy
		@user = User.find(params[:user_id])
		@user.destroy
		redirect_to admin_users_path
	end
end