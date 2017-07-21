class Admin::HomeController < ApplicationController
  def index
    @js_packs = ['admin/p_set']
  end
end
