module Admin::RegistrationKeyHelper
    def check
        keys = RegistrationKey.where(key: params[:registration_key])
        if keys.exists?
            key = keys[0]
            if Time.now - key.created_at > 86400
                true
            else
                false
            end
        else
            false
        end
    end
end