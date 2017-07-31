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
end
