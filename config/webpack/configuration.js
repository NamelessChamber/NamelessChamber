//"Nameless Chamber" - a music dictation web application.
//"Copyright 2020 Massachusetts Institute of Technology"

//This file is part of "Nameless Chamber"
    
//"Nameless Chamber" is free software: you can redistribute it and/or modify
//it under the terms of the GNU Affero General Public License as published by //the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//"Nameless Chamber" is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU Affero General Public License for more details.

//You should have received a copy of the GNU Affero General Public License
//along with "Nameless Chamber".  If not, see	<https://www.gnu.org/licenses/>.

//Contact Information: garo@mit.edu 
//Source Code: https://github.com/NamelessChamber/NamelessChamber





// Common configuration for webpacker loaded from config/webpack/paths.yml

const { join, resolve } = require('path')
const { env } = require('process')
const { safeLoad } = require('js-yaml')
const { readFileSync } = require('fs')

const configPath = resolve('config', 'webpack')
const loadersDir = join(__dirname, 'loaders')
const paths = safeLoad(readFileSync(join(configPath, 'paths.yml'), 'utf8'))[env.NODE_ENV]
const devServer = safeLoad(readFileSync(join(configPath, 'development.server.yml'), 'utf8'))[env.NODE_ENV]

// Compute public path based on environment and ASSET_HOST in production
const ifHasCDN = env.ASSET_HOST !== undefined && env.NODE_ENV === 'production'
const devServerUrl = `http://${devServer.host}:${devServer.port}/${paths.entry}/`
const publicUrl = ifHasCDN ? `${env.ASSET_HOST}/${paths.entry}/` : `/${paths.entry}/`
// const publicPath = env.NODE_ENV !== 'production' ? devServerUrl : publicUrl
// this fix allows for my proxy server to not interfere
const publicPath = env.NODE_ENV !== 'production' ? `/${paths.entry}/` : publicUrl

module.exports = {
  devServer,
  env,
  paths,
  loadersDir,
  publicUrl,
  publicPath
}
