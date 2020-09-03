#"Nameless Chamber" - a music dictation web application.
#"Copyright 2020 Massachusetts Institute of Technology"

#This file is part of "Nameless Chamber"
    
#"Nameless Chamber" is free software: you can redistribute it and/or modify
#it under the terms of the GNU Affero General Public License as published by #the Free Software Foundation, either version 3 of the License, or
#(at your option) any later version.

#"Nameless Chamber" is distributed in the hope that it will be useful,
#but WITHOUT ANY WARRANTY; without even the implied warranty of
#MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#GNU Affero General Public License for more details.

#You should have received a copy of the GNU Affero General Public License
#along with "Nameless Chamber".  If not, see	<https://www.gnu.org/licenses/>.

#Contact Information: garo@mit.edu 
#Source Code: https://github.com/NamelessChamber/NamelessChamber




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
			.select('p_set_answers.id AS id')
	end
end
