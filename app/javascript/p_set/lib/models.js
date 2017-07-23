import _ from 'lodash';

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

export function formatKey(key) {
  return key.replace(/([A-Z,a-z])b$/, '$1♭');
}

export function newStave(clef, name, measures, tonicPitch) {
  return {
    clef,
    name,
    tonic: {pitch: tonicPitch},
    // scale: '',
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

export function newPSet() {
  function initBoolOpts(opts) {
    return opts.map(x => [x, false]);
  }

  return {
    name: '',
    data: {
      options: {
        rhythm: initBoolOpts([
          '1', '2', '4', '8', '16', '32',
          '1r', '2r', '4r', '8r', '16r', '32r'
        ]),
        solfege: initBoolOpts([
          'do', 're', 'mi', 'fa', 'so', 'la', 'ti',
          'di', 'ri', 'fi', 'si', 'li', 'ra',
          'meh', 'seh', 'leh', 'teh'
        ]),
        harmony: initBoolOpts([
          'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viio',
          'vio', 'i', 'II', 'iio', 'III', 'III+', 'iv',
          'v', 'VI', 'VII', 'VII+', 'N6', 'Gr+6', 'Fr+6',
          'It+6', 'V/V', 'V/ii', 'V/iii', 'V/vi', 'V/IV'
        ]),
        inversion: initBoolOpts([
          '6', '6/4', '4/3', '4/2', '6/3', '6/5', '7'
        ]),
        key: initBoolOpts([
          'C', 'D', 'E', 'F', 'G', 'A', 'B',
          'Cb', 'Db', 'Eb', 'Gb', 'Ab', 'Bb',
          'C#', 'F#', 'G#',
          'c', 'd', 'e', 'f', 'g', 'a', 'b',
          'cb', 'db', 'eb', 'gb', 'ab', 'bb',
          'c#', 'e#', 'f#', 'g#'
        ]),
      },
      key: null,
      staves: [],
      meter: {top: 0, bottom: 0},
      measures: 0
    }
  };
}
