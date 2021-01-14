# frozen_string_literal: true

module Admin
  class HomeController < ApplicationController
    def index
      @js_packs = ['admin/p_set']
    end
  end
end
