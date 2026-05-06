Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      devise_for :users,
        path: "auth",
        path_names: {
          sign_in:  "sign_in",
          sign_out: "sign_out",
          registration: "register"
        },
        controllers: {
          sessions:      "api/v1/auth/sessions",
          registrations: "api/v1/auth/registrations"
        },
        defaults: { format: :json }

      resources :courses do
        resources :lessons, shallow: true
      end
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end