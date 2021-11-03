import 'core-js/stable'
import 'regenerator-runtime/runtime'
// import 'foundation-sites'
import PSet from '@/p_set'

import Rails from '@rails/ujs'

// import '@/stylesheets/application'

window.Rails = Rails

Rails.start()

$(document).foundation()

PSet.init()
