module HomeHelper
    def get_key
        keys = RegistrationKey.all
        if keys.exists?
            key = keys[0]
            if Time.now - key.created_at > 86400 
                false
            else
                key.key
            end
        else
            false
        end
    end
end
