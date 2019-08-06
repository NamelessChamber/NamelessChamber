class RegistrationKeyController < ActionController::Base
    include RegistrationKeyHelper
    def create
        puts "HOWDY PARTNER!"
        if RegistrationKey.all.length > 0
            RegistrationKey.destroy_all
        end
        key = (0...50).map { ('a'..'z').to_a[rand(26)] }.join
        RegistrationKey.create(key:key)
    end
end