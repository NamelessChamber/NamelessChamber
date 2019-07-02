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

	def answers
		@student = User.find(params[:user_id])
		@answers = PSetAnswer
			.where(user: @student)
			.where(completed: true)
			.joins(:p_set)
			.select('p_sets.name AS name')
			.select('p_set_answers.updated_at AS updated_at')
	end
end