# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users

  namespace :admin do
    resources :classroom_psets, only: %i[create destroy show]

    resources :p_set_answers, only: %i[show destroy]
    resources :users, only: %i[index destroy] do
      get :p_set_answers
    end

    resources :courses do
      resources :classrooms do
        get 'assign', to: 'classrooms#assign'
        post 'remove_student/:user_id', to: 'classrooms#remove_student', as: 'remove_student'
      end
    end

    resources :exercise_categories, only: %i[index new create destroy] do
      resources :exercise_subcategories, only: %i[new create destroy]
    end

    resources :p_sets, only: %i[show new create edit destroy] do
      get 'options', to: 'home#index'
      get 'rhythm', to: 'home#index'
      get 'melody', to: 'home#index'
      get 'harmony', to: 'home#index'

      get 'audios/new', to: 'p_sets#new_audio'
      post 'audios', to: 'p_sets#create_audio'
      delete 'audios/:p_set_audio_id', to: 'p_sets#destroy_audio', as: 'audio'
    end
  end

  get 'registration_key', to: 'registration_key#create'
  get 'registration_key_show', to: 'registration_key#show'
  post 'registration_key_check', to: 'registration_key#check'

  resources :p_sets, only: %i[show] do
    get 'rhythm', to: 'home#index'
    get 'melody', to: 'home#index'
    get 'harmony', to: 'home#index'

    get 'answer', to: 'p_sets#show_answer'
    put 'answer', to: 'p_sets#update_answer'
  end

  get 'classrooms/register', to: 'classrooms#registrar'

  resources :classrooms, only: %i[index show] do
    get 'register', to: 'classrooms#register'
    post 'register', to: 'classrooms#signup'
  end

  root to: 'home#splash'
end
