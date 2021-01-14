source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?('/')
  "https://github.com/#{repo_name}.git"
end

gem 'active_model_serializers'

gem 'pg'
gem 'puma'
gem 'rails', '~> 6.1'
gem 'sass-rails'
gem 'uglifier'

gem 'carrierwave'
gem 'devise'
gem 'fog-aws'
gem 'foundation-rails'
gem 'jbuilder'
gem 'jquery-rails'
gem 'react-rails'
gem 'webpacker', '~> 5.2'

group :development, :test do
  gem 'byebug', platform: :mri

  gem 'rubocop', '~> 1.7', require: false
  gem 'rubocop-md', require: false
  gem 'rubocop-performance', require: false
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
  gem 'standard'
end

group :development do
  gem 'annotate'
  gem 'listen', '~> 3'
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'web-console', '>= 3.3.0'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]
