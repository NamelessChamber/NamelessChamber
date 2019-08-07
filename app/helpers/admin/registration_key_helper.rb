module Admin::RegistrationKeyHelper
    def check_key(key)
        keys = RegistrationKey.where(key: key)
        if keys.exists?
            key = keys[0]
            if Time.now - key.created_at < 86400
                true
            else
                false
            end
        else
            false
        end
    end
end