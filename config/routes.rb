Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  namespace :admin do
    resources :courses do
      resources :classrooms
    end

    resources :exercise_categories do
      resources :exercise_subcategories
    end

    resources :p_sets do
      get 'data', to: 'p_sets#show_data'
      put 'data', to: 'p_sets#update_data'
    end
  end

  root to: 'home#index'
end
