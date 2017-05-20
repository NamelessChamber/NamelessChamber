import _ from 'lodash';

class Note {
  constructor(opts = {}) {
    const defaults = {
      type: 'note',
      solfege: null,
      relativeOctave: 0,
      duration: null,
      dots: 0
    };
    const props = [
      'solfege',
      'relativeOctave',
      'duration',
      'dots'
    ];

    Object.assign(this, defaults, _.pluck(opts, props));
  }
}


