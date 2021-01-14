# frozen_string_literal: true

source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?('/')
  "https://github.com/#{repo_name}.git"
end

gem 'active_model_serializers'
gem 'carrierwave'
gem 'devise'
gem 'fog-aws'
gem 'pg'
gem 'puma'
gem 'rails', '~> 6.1'

# Assets
gem 'foundation-rails'
gem 'jbuilder'
gem 'jquery-rails'
gem 'react-rails'
gem 'sass-rails'
gem 'uglifier'
gem 'webpacker', '~> 5.2'

group :development, :test do
  gem 'dotenv-rails'
  gem 'pry-rails'

  gem 'factory_bot_rails', '~> 6.0'
  gem 'rspec-rails', '~> 4.0'

  gem 'rubocop', '~> 1.7', require: false
  gem 'rubocop-md', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
  gem 'standard'
end

group :development do
  gem 'listen', '~> 3'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :test do
  gem 'database_cleaner', '~> 1.8'
  gem 'faker', '~> 2'
  gem 'shoulda-matchers', '~> 4'
end
