Rails.application.routes.draw do
  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  namespace :admin do
    resources :classroom_psets, only: [:create, :destroy, :show]

    resources :p_set_answers, only: [:show]

    resources :courses do
      resources :classrooms do
        get 'assign', to: 'classrooms#assign'
      end
    end

    resources :exercise_categories do
      resources :exercise_subcategories
    end

    resources :p_sets do
      get 'options', to: 'home#index'
      get 'rhythm', to: 'home#index'
      get 'melody', to: 'home#index'
      get 'harmony', to: 'home#index'

      get 'audios/new', to: 'p_sets#new_audio'
      post 'audios', to: 'p_sets#create_audio'
      delete 'audios/:p_set_audio_id', to: 'p_sets#destroy_audio', as: 'audio'
    end
  end

  resources :p_sets do
    get 'rhythm', to: 'home#index'
    get 'melody', to: 'home#index'
    get 'harmony', to: 'home#index'

    get 'answer', to: 'p_sets#show_answer'
    put 'answer', to: 'p_sets#update_answer'
  end

  resources :classrooms

  root to: 'home#splash'
end
