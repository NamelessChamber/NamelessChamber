# frozen_string_literal: true

module Admin
  module ClassroomPsetsHelper
    def fulldate(datetime)
      datetime.strftime('%Y-%m-%d %I:%M:%S %p')
    end
  end
end
