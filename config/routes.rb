Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  namespace :admin do
    resources :courses do
      resources :classrooms
    end
  end

  root to: 'home#index'
end
