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




class Admin::PSetAnswersController < ApplicationController
  def show
    if !@current_user_is_admin
      head :unauthorized
      return
    end

    begin
      @p_set_answer = PSetAnswer.find(params[:id])
    rescue ActiveRecord::RecordNotFoundError
      head :not_found
      return
    end

    @user = @p_set_answer.user
    @p_set = @p_set_answer.p_set

    @js_packs = ['admin/p_set']

    respond_to do |format|
      format.json { render json: @p_set_answer }
      format.html { render }
    end
  end

	def destroy
		@answer = PSetAnswer.find(params[:id])
		@student = User.find(@answer.user_id)
		@answer.destroy
		redirect_to admin_user_p_set_answers_path(@student)
	end
end
