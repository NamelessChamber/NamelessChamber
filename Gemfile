# "Nameless Chamber" - a music dictation web application.
# "Copyright 2020 Massachusetts Institute of Technology"

# This file is part of "Nameless Chamber"

# "Nameless Chamber" is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# "Nameless Chamber" is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with "Nameless Chamber".  If not, see	<https://www.gnu.org/licenses/>.

# Contact Information: garo@mit.edu
# Source Code: https://github.com/NamelessChamber/NamelessChamber

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
