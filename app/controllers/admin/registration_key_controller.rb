class Admin::RegistrationKeyController < ActionController::Base
    include Admin::RegistrationKeyHelper
    def create
        puts "HOWDY PARTNER!"
        if RegistrationKey.all.length > 0
            RegistrationKey.destroy_all
        end
        alpha = ('A'..'Z').to_a.concat(('a'..'z').to_a)
        alpha_numeric = ('0'..'9').to_a.concat(alpha)
        key = (0...8).map { alpha_numeric[rand(62)] }.join
        RegistrationKey.create(key:key)
        redirect_to root_path
    end
end