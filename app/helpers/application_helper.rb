# frozen_string_literal: true

module ApplicationHelper
  def fulldate(datetime)
    datetime.strftime('%Y-%m-%d %I:%M:%S %p')
  end
end
