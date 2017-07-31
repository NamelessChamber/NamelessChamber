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
