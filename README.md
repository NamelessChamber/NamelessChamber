# Nameless Chamber

A music dictation web application.

Nameless Chamber was designed as an application with a specific process
for teaching dictation skills through moveable-do solfege. This core concept needs
further functionality and bug-fixing (see list below) and we welcome any help with this
or suggestions for additional functionality.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/heroku/node-js-getting-started)


### dev install

#### general notes

- assumes that postgres server is running locally
- post-successful installation of rbenv and ruby 2.7.2 (see below if you're having openssl-related trouble on macos):
  - run `gem install bundler` and make sure that it's the rbenv 2.7.2 ruby version that's installing the gem (you'll get an error if it's the wrong ruby version that's attempting to install the gem)
- you may have to run `bundle update mimemagic` before any other commands as the mimemagic version specified in the Gemfile.lock is not available anymore

#### post-install steps

- create db: `bundle exec rails db:create`
  - check that database has been created locally in postgres
- migrate db: `bundle exec rails db:migrate`
- seed db: `bundle exec rails db:seed`
- frontend: run `npm install` (using npm v15 -- see below for npm version notes)
  - check that `bin/webpack-dev-server` runs normally

#### random notes from a difficult installation on macos:

- `brew uninstall ruby ruby-build rbenv` before proceeding
- `brew cleanup`, `brew update`, `brew upgrade` everything
- `sudo rm -rf ~/.gem` sub-directories before running `rbenv install 2.7.2`
  - see https://github.com/rbenv/ruby-build/issues/1483
- run `rbenv init` and follow installation instructions into `~/.bash_profile`
- also run rbenv doctor and follow advice?
  - curl -fsSL https://github.com/rbenv/rbenv-installer/raw/main/bin/rbenv-doctor | bash
- when successful, set `rbenv local 2.7.2` and `rbenv global 2.7.2`
- use `ruby --version` when necessary to check current ruby binary version

#### npm / nvm note

- as the official docs of npm [say](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), "We strongly recommend using a Node version manager like nvm to install Node.js and npm"
- do install nvm by following the instructions [here](https://github.com/nvm-sh/nvm) -- typically, the `curl ... | bash` should work / be enough
- DO run npm version 15 when running this project. npm version 16 is proven to not work (seemingly related to node-gyp -- maybe).

### Develop

Start the backend server:

```bash
bundle exec rails server
```

Start watching assets and compile:

```bash
bin/webpack-dev-server
```

### Test

Run the backend test suite:

```bash
bundle exec rspec
```

### misc notes

- in development, to clear the database and insert the seed data again, run:
```ruby
bundle exec rails db:reset
bundle exec rails db:migrate
```
-- `db:reset` runs `db:seed` -- see https://stackoverflow.com/a/10302357

### misc

Please look under the github Issues tab for the most recent bugs, and future
functionality for frontend/backend.

Here is a link if you need to set up a virtual environment for Nameless:
https://docs.google.com/document/d/15KqQYoWOaMYdRl0zqi5a3HmNomLHzf1FXGwP8r-Vf6s/edit?usp=sharing

And here are two videos to acquaint you with the application:

https://drive.google.com/file/d/1NevbrhLLVg9w0qifJinui9LE3u08e0wd/view?usp=sharing

https://drive.google.com/file/d/1Nprcv3B4ytS6KuGmh9SjXAXjeFHabPPX/view?usp=sharing

## License

Copyright 2020 Massachusetts Institute of Technology

"Nameless Chamber" is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

"Nameless Chamber" is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the [License](LICENSE.md) for more details.
