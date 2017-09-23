import _ from 'lodash';
import Fraction from 'fraction.js';

/*
 * {
 *   data: {
 *      options: {
 *       rhythm: [
 *         []
 *       ]
 *      }
 *   }
 * }
 */

function scanl(f, initial, list) {
  return list.reduce(([out, acc], x, i) => {
    const res = f(acc, x, i);
    out.push(res);
    return [out, res];
  }, [[], initial])[0];
}

export function countBeats(measure) {
  return measure.notes.reduce((total, note, i) => {
    let { duration, dots } = note;
    duration = duration.replace('r', '');
    duration = new Fraction(1, parseInt(duration));
    dots = scanl((m) => m.div(2), duration, _.range(dots));
    duration = dots.reduce((m, x) => m.add(x), duration);
    return total.add(duration);
  }, new Fraction(0));
}

export function compareMeter(meter, measure) {
  const { top, bottom } = meter;
  const expectedBeats = new Fraction(top, bottom);
  const actualBeats = countBeats(measure);

  return expectedBeats.compare(actualBeats);
}

export function formatKey(key) {
  return key.replace(/([A-Z,a-z])b$/, '$1♭');
}

export function validateOptions(data) {
  let errors = [];

  if (data.staves.length === 0) {
    errors.push('No staves added');
  } else {
    errors = errors.concat(_.flatMap(data.staves, (s) => {
      function addErrors([path, name]) {
          if (_.isUndefined(_.get(s, path))) {
            return [`Stave ${s.name} is missing ${name}`];
          }
          return [];
      }
      const opts = [['tonic.pitch', 'tonic pitch'],
                    ['tonic.octave', 'tonic octave'],
                    ['scale', 'scale']];
      return _.flatMap(opts, addErrors);
    }));
  }

  if (data.meter.top === 0 || data.meter.bottom === 0) {
    errors.push('Invalid meter, neither part can be 0');
  }

  if (errors.length > 0) {
    return errors;
  }
}

export function newAnswer(pSet) {
  pSet = _.cloneDeep(pSet);
  return {
    meter: {top: 0, bottom: 0},
    keySignature: '',
    staves: pSet.data.staves.map((stave) =>
      stave.solution.map((measure) => _.set(measure, 'notes', []))
    )
  }
}

export function newStave(clef, name, measures, tonicPitch, scale) {
  tonicPitch = tonicPitch || 'C';
  scale = scale || 'major';
  return {
    clef,
    name,
    tonic: {pitch: tonicPitch, octave: 0},
    scale,
    solution: _.range(measures)
      .map((i) => {
        return {
          endBar: (i === measures - 1) ?
            'end' :
            'single',
          notes: []
        };
      }),
    answer: _.range(measures)
      .map((i) => {
        return {
          endBar: (i === measures - 1) ?
            'end' :
            'single',
          notes: []
        };
      }),
    audios: {
      rhythm: [],
      melody: []
    }
  };
}

export const DEFAULTS = {
  rhythm: [
    '1', '2', '4', '8', '16', '32'
  ],
  solfege: [
    'do', 're', 'mi', 'fa', 'so', 'la', 'ti',
    'di', 'ri', 'fi', 'si', 'li', 'ra',
    'me', 'se', 'le', 'te'
  ],
  harmony: [
    'I', 'ii', 'iiØ', 'iii', 'IV', 'V', 'vi', 'viio', 'viiØ',
    'vio', 'i', 'II', 'iio', 'III', 'III+', 'iv',
    'v', 'VI', 'VII', 'VII+', 'N6', 'Gr+6', 'Fr+6',
    'It+6', 'V/V', 'V/ii', 'V/iii', 'V/vi', 'V/IV',
    'V/iio', 'V/IIIo', 'V/ivo', 'V/VIo', 'V/VIIo'
  ],
  inversion: [
    '6', '6/4', '4/3', '4/2', '6/5', '7'
  ],
  key: [
    'C', 'D', 'E', 'F', 'G', 'A', 'B',
    'Cb', 'Db', 'Eb', 'Gb', 'Ab', 'Bb',
    'C#', 'F#', 'G#',
    'c', 'd', 'e', 'f', 'g', 'a', 'b',
    'cb', 'db', 'eb', 'gb', 'ab', 'bb',
    'c#', 'f#', 'g#'
  ]
};

export function newPSet() {
  function initBoolOpts(opts) {
    return opts.map(x => [x, false]);
  }

  return {
    options: {
      rhythm: initBoolOpts(DEFAULTS.rhythm),
      solfege: initBoolOpts(DEFAULTS.solfege),
      harmony: initBoolOpts(DEFAULTS.harmony),
      inversion: initBoolOpts(DEFAULTS.inversion),
      key: initBoolOpts(DEFAULTS.key),
    },
    staves: [],
    meter: {top: 0, bottom: 0},
    measures: 0
  };
}
