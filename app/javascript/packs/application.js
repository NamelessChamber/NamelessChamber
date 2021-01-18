import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'foundation-sites'

import Rails from '@rails/ujs'

import '../stylesheets/application'

global.Rails = Rails

Rails.start()

$(document).foundation()
