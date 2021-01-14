# frozen_string_literal: true

class HomeController < ApplicationController
  include HomeHelper
  def index
    @js_packs = ['admin/p_set']
  end

  def splash
    @key = get_key
  end
end
