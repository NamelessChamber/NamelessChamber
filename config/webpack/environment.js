const webpack = require('webpack')
const { environment } = require('@rails/webpacker')

environment.plugins.prepend(
  'Provide',
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    jquery: 'jquery',
  })
)

module.exports = environment
