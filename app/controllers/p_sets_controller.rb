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




class PSetsController < ApplicationController
  before_action :find_p_set, except: [:index]

  def show
    respond_to do |format|
      format.json { render json: @p_set }
    end
  end

  def show_answer
    @p_set_answer = p_set_answer

    if @p_set_answer.nil?
      if User.joins(:classrooms => {:classroom_psets => :p_set})
        .where(p_sets: {id: params[:p_set_id]}).exists?
        @p_set_answer = PSetAnswer.create(
          user: current_user,
          p_set: @p_set,
          data: {answer: nil, submissions: []}
        )
      else
        error = {error: 'User not enrolled in class'}
        render json: error, status: :unauthorized
        return
      end
    end

    answer = @p_set_answer.data['answer']
    respond_to do |format|
      format.json { render json: {answer: answer} }
    end
  end

  def update_answer
    @p_set_answer = p_set_answer

    if @p_set_answer.nil?
      head :not_found
    else
      answer = params[:answer]
      answer['created_at'] = Time.now
      @p_set_answer.data['answer'] = answer

      if params[:submission]
        @p_set_answer.data['submissions'].push(answer)
      end

      if !params[:completed].nil?
        if !@p_set_answer.completed && params[:completed]
          @p_set_answer.completed = params[:completed]
        end
      end

      @p_set_answer.save

      respond_to do |format|
        format.json { render json: answer }
      end
    end
  end

  private

  def p_set_answer
    id = params[:p_set_id] || params[:id]
    PSetAnswer.find_by(
      user_id: current_user.id,
      p_set_id: id
    )
  end

  def find_p_set
    find_or_404 do
      id = params[:p_set_id] || params[:id]
      @p_set = PSet.find(id)
    end
  end
end
