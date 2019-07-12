import _ from 'lodash';
import teoria from 'teoria';
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

 /*
 steps:

 1. measureWidth(measure, [key, only present for first measure])
 2. displayableRange(width, staves, start measure)
 */


export function measureLength(measure) {
  return measure.notes.reduce((acc, item) => {
    if (item.type === 'note') {
      return acc + 1 + ((item.dots || 0) * 0.2);
    } else if (item.type === 'beam') {
      return acc + measureLength(item.notes);
    }
  }, 0);
}

// key is solution or answer
export function measureLengths(key, staves) {
  const firstStave = staves[0][key];
  return _.range(firstStave.length)
    .map((i) => {
      return staves
        .map(stave => stave[key])
        .reduce((max, stave) => {
        const current = measureLength(stave[i]);
        return Math.max(max, current);
      }, 0);
    });
}

export function displayableRange(canvasWidth, key, staves, startMeasure) {
  const lengths = measureLengths(key, staves);
  const lengthsFromIx = _.slice(lengths, startMeasure);
  const widths = scanl((m, x) => m + (Math.max(x * 45, 70)), 115 /* for clef */, lengthsFromIx);
  const maxIndex = startMeasure + widths.length;
  const indices = _.range(startMeasure, maxIndex)
  return _.takeWhile(indices, (_, i) => widths[i] <= canvasWidth);
}

export function displayableMeasures(canvasWidth, key, staves, startMeasure) {
  const range = displayableRange(canvasWidth, key, staves, startMeasure);
  return _.last(range) - _.first(range) + 1;
}

export function currentPage(canvasWidth, key, staves, currentMeasure, startMeasure = 0) {
  const result = displayableRange(canvasWidth, key, staves, startMeasure);
  if (_.indexOf(result, currentMeasure) === -1) {
    return currentPage(canvasWidth, key, staves, currentMeasure, startMeasure + result.length);
  } else {
    return result;
  }
}

export function nextNonEmptyMeasure(measures, i = 0) {
  return _.findIndex(measures, (m) => m.notes.length > 0, i);
}

export function prevNonEmptyMeasure(measures, i) {
  measures = _.slice(measures, 0, i);
  return _.findLastIndex(measures, (m) => m.notes.length > 0);
}

function scanl(f, initial, list) {
  return list.reduce(([out, acc], x, i) => {
    const res = f(acc, x, i);
    out.push(res);
    return [out, res];
  }, [[], initial])[0];
}

// for use on the student side
export function keyOptionToSignature(key) {
  if (_.isUndefined(key) || _.isNull(key) || key === '') {
    return '';
  }

  if (key === key.toLowerCase()) {
    key = key.toUpperCase() + 'm';
  }

  return key;
}

export function tonicStr(tonic) {
  return (`${tonic.pitch}${tonic.octave}`).toLowerCase();
}

export function getVFScaleName(tonic, scale) {
  const note = teoria.note(tonicStr(tonic));
  let res = note.name().toUpperCase() + note.accidental();

  if (_.includes(['minor', 'aeolian'], scale)) {
    res += 'm';
  }

  return res;
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

export function compareMeters(meter, stave, pickUpBeat) {
  const regular = pickUpBeat ?
    _.slice(stave, 1, stave.length - 1) :
    stave;
  const results = regular.map((measure) => compareMeter(meter, measure));

  if (pickUpBeat) {
    // truncate first and last
    const { top, bottom } = meter;
    const meterBeats = new Fraction(top, bottom);
    const pickUpMeasure = _.first(stave);
    const lastMeasure = _.last(stave);
    const pickUpBeats = countBeats(pickUpMeasure);
    const lastMeasureBeats = countBeats(lastMeasure);
    const lastMeasureExpected = meterBeats.sub(pickUpBeats);
    results.unshift(0);
    results.push(lastMeasureExpected.compare(lastMeasureBeats));
  }

  return results;
}

export function compareMeterAt(meter, stave, pickUpBeat, i) {
  return compareMeters(meter, stave, pickUpBeat)[i];
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

export function validatePickupBeat(meter, beat) {
  // strictly LT, otherwise it's not a pickup
  return (beat.top / beat.bottom) < (meter.top / meter.bottom) &&
    beat.top > 0 &&
    beat.bottom > 0;
}

export function pickupOptions(meter, rhythmicOptions) {
  const m = new Fraction(meter.top, meter.bottom);
  const denominator = _
    .chain(rhythmicOptions)
    .filter(([_, enabled]) => enabled)
    .map(([n, _]) => n)
    .sortBy(n => 1 / n)
    .head()
    .value();
  const numerators = _.range(1, denominator);
  const options = _
    .chain(numerators)
    .map(n => new Fraction(n, denominator))
    .filter(x => x.compare(m) < 0)
    .map(x => x.toFraction())
    .value();

  return options;
}

export function pickupRests(meter, pickupBeat) {
  const goal = new Fraction(meter.top, meter.bottom)
    .sub(new Fraction(pickupBeat.top, pickupBeat.bottom));
  let increment = new Fraction(1, meter.bottom);
  let sum = new Fraction(0);
  const rests = [];
  while (sum.compare(goal) < 0) {
    if (sum.add(increment).compare(goal) > 0) {
      increment = increment.div(2);
    }
    rests.push(increment);
    sum = sum.add(increment);
  }

  return rests
    .map(x => x.toFraction() + 'r')
    .map(x => {
      return {type: 'note', duration: x, dots: 0, tied: false};
    });
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

export function getAnswerErrors(solution, answer, mode) {
  const staves = _.zipWith(
    solution,
    answer,
    (s, a) => {
      return Object.assign(s, {answer: a});
    });

  return staves.map((stave) => {
    const { answer, solution } = stave;

    return _.zipWith(answer, solution, (m1, m2) => {
      return _.zipWith(m1.notes, m2.notes, (n1, n2) => {
        if (_.isUndefined(n1)) {
          if (!_.isUndefined(n2)) {
            return true;
          }
          return false;
        }

        if (_.isUndefined(n2)) {
          return true;
        }

        let error = false;
        switch (mode) {
          case 'harmony':
            error = !_.isEqual(n1, n2);
            break;
          case 'melody':
            error = error ||
              n1.solfege !== n2.solfege ||
              n1.octave !== n2.octave;
          case 'rhythm':
            error = error ||
              n1.duration !== n2.duration ||
              n1.tied !== n2.tied ||
              n1.dots !== n2.dots;
        }

        return error;
      });
    });
  });
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

export function durationString(duration) {
  const NOTE_MAP = {
    '1': '\u{1D15D}',
    '2': '\u{1D15E}',
    '4': '\u{1D15F}',
    '8': '\u{1D160}',
    '16': '\u{1D161}',
    '32': '\u{1D162}',
    '1r': '\u{1D13B}',
    '2r': '\u{1D13C}',
    '4r': '\u{1D13D}',
    '8r': '\u{1D13E}',
    '16r': '\u{1D13F}',
    '32r': '\u{1D140}'
  };

  return NOTE_MAP[duration];
};

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
    },
    pickupBeat: undefined
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
    'It+6', 'V/V', 'viio/V', 'V/ii', 'V/iii', 'V/vi', 'V/IV',
    'V/iio', 'V/III', 'V/iv', 'V/VI', 'viio/VI', 'V/VII', 'viio/VII',
    'viio/ii', 'viio/iii', 'viio/vi', 'viio/IV'
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
    pickUpBeat: false,
    staves: [],
    meter: {top: 0, bottom: 0},
    measures: 0
  };
}

// Supports multiple audio players
// Pauses all audio players if at least one is playing
// Plays all audio players if all are paused
export function changeAudioPlayerState(){
  var players = document.getElementsByClassName("react-audio-player");
  if (!players.length){ return; }
  var paused = true;

  Array.prototype.forEach.call(players, function(player){
    paused = paused && player.paused;
  });

  if (paused){ 
    Array.prototype.forEach.call(players, function(player) {player.play();});
  } else{
    Array.prototype.forEach.call(players, function(player) {player.paused();});
  }
}

// Returns the index for the next option in the select according to the key given
// Assumes that the first select object in the document is the stave selector
export function nextStave(key){
  var select = document.getElementsByTagName("select")[0];
  var length = select.options.length;
  var index = select.selectedIndex;
  index += (key == '>')? 1 : -1;
  return (index + length) % length;
}