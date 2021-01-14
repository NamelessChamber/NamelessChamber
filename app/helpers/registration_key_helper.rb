# frozen_string_literal: true

module RegistrationKeyHelper
  def check_key(key)
    keys = RegistrationKey.where(key: key)
    if keys.exists?
      key = keys[0]
      Time.zone.now - key.created_at < 86_400
    else
      false
    end
  end
end
