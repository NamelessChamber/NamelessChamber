# frozen_string_literal: true

module HomeHelper
  def get_key
    keys = RegistrationKey.all
    if keys.exists?
      key = keys[0]
      if Time.zone.now - key.created_at > 86_400
        false
      else
        key.key
      end
    else
      false
    end
  end
end
