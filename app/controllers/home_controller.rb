# frozen_string_literal: true

class HomeController < ApplicationController
  include HomeHelper
  def index; end

  def splash
    @key = get_key
  end
end
