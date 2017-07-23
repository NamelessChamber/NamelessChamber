import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Vex from 'vexflow';
import teoria from 'teoria';
import { fromSemitones } from 'tonal-interval';
import _ from 'lodash';

const VF = Vex.Flow;

// lifted from teoria... sadly not exposed
const intervalSolfege = {
  'dd1': 'daw',
  'd1': 'de',
  'P1': 'do',
  'A1': 'di',
  'AA1': 'dai',
  'd2': 'raw',
  'm2': 'ra',
  'M2': 're',
  'A2': 'ri',
  'AA2': 'rai',
  'd3': 'maw',
  'm3': 'me',
  'M3': 'mi',
  'A3': 'mai',
  'dd4': 'faw',
  'd4': 'fe',
  'P4': 'fa',
  'A4': 'fi',
  'AA4': 'fai',
  'dd5': 'saw',
  'd5': 'se',
  'P5': 'so',
  'A5': 'si',
  'AA5': 'sai',
  'd6': 'law',
  'm6': 'le',
  'M6': 'la',
  'A6': 'li',
  'AA6': 'lai',
  'd7': 'taw',
  'm7': 'te',
  'M7': 'ti',
  'A7': 'tai',
  // 'dd8': 'daw',
  // 'd8': 'de',
  // 'P8': 'do',
  // 'A8': 'di',
  // 'AA8': 'dai'
};

const solfegeInterval = _.invert(intervalSolfege);

const noteEq = (n1, n2) => {
  return _.isEqual(n1.coord, n2.coord);
};

const noteRelEq = (n1, n2) => {
  const [n1o, n1f] = n1.coord;
  const [n2o, n2f] = n2.coord;
  const semisDiff = ((n1o - n2o) * 12) + ((n1f - n2f) * 7);
  return semisDiff % 12 == 0;
};

const tonicStr = (tonic) => {
  return (`${tonic.pitch}${tonic.octave}`).toLowerCase();
};

const getNote = (tonic, octave, solfege) => {
  const interval = solfegeInterval[solfege];
  const note = teoria.note(`${tonicStr(tonic)}`);

  note.coord[0] += octave;
  return note.interval(interval);
};

const getVFScaleName = (tonic, scale) => {
  const note = teoria.note(tonicStr(tonic));
  let res = note.name() + note.accidental();
  res = res.toUpperCase();

  if (_.includes(['minor', 'aeolian'], scale)) {
    res += 'm';
  }

  return res;
};

const getAccidentalToRender = (scale, note) => {
  const simpleNoteName = note.name() + note.accidental();
  const notInScale = _.isUndefined(
    _.find(scale.notes(), _.bind(noteRelEq, this, note))
  );

  if (notInScale) {
    const accidental = note.accidental();
    if (accidental === '') {
      return 'n';
    } else {
      return accidental;
    }
  } else {
    return null;
  }
};

const staveComplete = (stave, render) => {
  return _.every(stave[render], (measure) => {
    return _.every(measure.notes, (note) => {
      return _.endsWith(note.duration, 'r') ||
        (!_.isUndefined(note.solfege) && !_.isUndefined(note.octave));
    });
  });
};

const STAVE_HEIGHT = 125;
const RENDER_MODES = {
  RHYTHMIC: 0,
  MELODIC: 1,
  STANDARD: 2
};


export default class VexflowComponent extends React.Component {
  constructor(props) {
    super(props);

    this.renderer = null;
  }

  static propTypes = {
    staves: PropTypes.array.isRequired,
    render: PropTypes.string.isRequired,
    meter: PropTypes.object.isRequired,
    mode: PropTypes.number.isRequired,
    editing: PropTypes.number,
    keySignature: PropTypes.string,
    currentMeasure: PropTypes.number,
    currentNote: PropTypes.number,
    startMeasure: PropTypes.number,
    numMeasures: PropTypes.number,
    measures: PropTypes.number.isRequired,
    staveErrors: PropTypes.array
  }

  static RenderMode = RENDER_MODES;

  static defaultProps = {
    mode: VexflowComponent.RenderMode.MELODIC,
    startMeasure: 0,
    numMeasures: 4,
  }

  meterToString(props) {
    if (props.meter.top && props.meter.bottom) {
      return `${props.meter.top}/${props.meter.bottom}`;
    }
  }

  defaultLineForStave(clef) {
    if (clef === 'treble') {
      return ['b/4'];
    } else if (clef === 'bass') {
      return ['d/3'];
    } else if (clef === 'alto') {
      return ['c/4'];
    } else if (clef === 'tenor') {
      return ['a/3'];
    } else {
      return ['c/4'];
    }
  }

  convertNote(props, error, highlight, editing, stave, renderMode, note, i) {
    const { type } = note;
    const { mode } = props;

    const { solfege, octave, duration } = note;
    let keys = this.defaultLineForStave(stave.clef);
    let accidental = null;
    if (renderMode === RENDER_MODES.MELODIC &&
        !_.isUndefined(solfege) && !_.isUndefined(octave)) {
      const tNote = getNote(stave.tonic, octave, solfege);
      const scale = teoria.scale(tonicStr(stave.tonic), stave.scale);
      keys = [`${tNote.name()}/${tNote.octave()}`];
      accidental = getAccidentalToRender(scale, tNote);
    }

    const staveNote = new VF.StaveNote({
      duration: duration,
      keys: keys,
      clef: stave.clef
    });

    if (error && editing) {
      const annotation = new VF.Annotation('x')
        .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
      staveNote.addModifier(0, annotation);
    }

    if (renderMode === RENDER_MODES.MELODIC &&
        (_.isUndefined(solfege) || _.isUndefined(octave)) &&
        editing) {
      const annotation = new VF.Annotation('?')
        .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
      staveNote.addModifier(0, annotation);
    }

    if (highlight &&
        _.isNumber(props.currentNote) &&
      renderMode === RENDER_MODES.MELODIC) {
      if (i === props.currentNote) {
        const annotation = new VF.Annotation('▲')
          .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
        staveNote.addModifier(0, annotation);
      }
    }

    if (!_.isUndefined(note.dots) && note.dots > 0) {
      _.times(note.dots, () => staveNote.addDotToAll());
    }

    if (!_.isNull(accidental)) {
      staveNote.addAccidental(0, new VF.Accidental(accidental));
    }

    return staveNote;
  }

  scoreToVoice(props, measureIndex, score, width, highlight, editing, stave, renderMode) {
    const context = this.renderer.getContext();

    const voiceOpts = (props.meter.top && props.meter.bottom) ?
      { num_beats: props.meter.top, beat_value: props.meter.bottom} :
      {};
    const voice = new VF.Voice(voiceOpts)
    voice.setMode(VF.Voice.Mode.SOFT);

    let notes = [];
    if (_.isUndefined(props.staveErrors)) {
      notes = score.map(
        this.convertNote.bind(this, props, false, highlight, editing, stave, renderMode)
      );
    } else {
      notes = score.map((n, i) => {
        const error = props.staveErrors[measureIndex][i];
        return this.convertNote(props, error, highlight, editing, stave, renderMode, n, i)
      });
    }
    const beams = VF.Beam.generateBeams(notes);

    voice.addTickables(notes);
    const formatter = new VF.Formatter()
      .joinVoices([voice])
      .format([voice], width);

    return [voice, beams];
  }

  redrawVexflow(props) {
    const context = this.renderer.getContext();
    context.clear();

    function scoreLength(score) {
      return score.reduce((acc, item) => {
        if (item.type === 'note') {
          return acc + 1 + ((item.dots || 0) * 0.2);
        } else if (item.type === 'beam') {
          return acc + scoreLength(item.notes);
        }
      }, 0);
    }

    this.staves = [];
    let lastStave = null;
    let yOffset = 25;
    const firstStaves = [];
    const formatter = new VF.Formatter();

    const firstStave = props.staves[0];
    const lastMeasure = Math.min(
      props.measures,
      props.startMeasure + props.numMeasures
    );
    const measureWidths =
      _.range(props.startMeasure,
              lastMeasure).map((i) => {
                return props.staves.reduce((m, x) => {
                  const measure = x[this.props.render][i];
                  const measureLength = scoreLength(measure.notes);
                  return Math.max(m, measureLength);
                }, 0);
              });

    props.staves.forEach((stave, e) => {
      let widthOffset = 5;

      let renderMode = props.mode;
      if (e !== props.editing && staveComplete(stave, props.render)) {
        renderMode = RENDER_MODES.MELODIC;
      }

      const scoreSlice = _.slice(
        stave[this.props.render],
        props.startMeasure,
        lastMeasure
      );
      scoreSlice.forEach((score, i) => {
        const index = i + props.startMeasure;

        const { notes } = score;
        let width = measureWidths[i] * 45;
        if (width === 0) {
          width = 50;
        }
        let offsetIncrement = width;

        if (index === 0) {
          // clef
          offsetIncrement += 100;
        }

        const staveObj = new VF.Stave(widthOffset, yOffset, offsetIncrement);
        staveObj.setContext(context);

        if (score.endBar) {
          staveObj.setEndBarType(VF.Barline.type[score.endBar.toUpperCase()]);
        }

        staveObj.setMeasure(index + 1);
        let highlight = false;
        const editing = e === props.editing;
        if (index === props.currentMeasure && editing) {
          highlight = true
          if (props.mode === RENDER_MODES.RHYTHMIC) {
            staveObj.setSection('▼', 0);
          }
        }

        const meter = this.meterToString(props);
        if (index === 0 && _.isString(meter)) {
          staveObj.addClef(stave.clef).addTimeSignature(meter);
          if (!( _.isUndefined(stave.tonic) ||
            _.isUndefined(stave.scale) )) {
            // const keySignature = getVFScaleName(stave.tonic, stave.scale);
            if (_.isString(props.keySignature) && props.keySignature !== '') {
              staveObj.addKeySignature(props.keySignature);
            }
          }
        }

        const [voice, beams] =
          this.scoreToVoice(props, index, notes, width, highlight, editing, stave, renderMode);
        voice.draw(context, staveObj);
        beams.forEach((b) => b.setContext(context).draw());

        staveObj.draw();

        widthOffset += offsetIncrement;
        this.staves.push(staveObj);

        if (index === 0) {
          firstStaves.push(staveObj);
        }
      });
      yOffset += STAVE_HEIGHT;
    });

    const stavePairs = firstStaves.reduce(([res, last], x) => {
      if (!_.isUndefined(last)) {
        res.push([last, x]);
      }
      return [res, x];
    }, [[]])
    this.connectors = stavePairs[0].map(([s1, s2]) => {
      if (_.isUndefined(s2)) {
        return;
      }
      const conn = new VF.StaveConnector(s1, s2);
      conn.setType(VF.StaveConnector.type.SINGLE_LEFT);
      conn.setContext(context);
      conn.draw();

      return conn;
    });
  }

  shouldComponentUpdate() {
    return true;
  }

  componentWillReceiveProps(newProps) {
    this.redrawVexflow(newProps);
  }

  componentDidMount() {
    const e = ReactDOM.findDOMNode(this.vexflowEl);
    const containerWidth = e.offsetWidth;

    this.renderer = new VF.Renderer(e, VF.Renderer.Backends.SVG);
    const height = STAVE_HEIGHT * this.props.staves.length + 50;
    this.renderer.resize(containerWidth, height);

    const context = this.renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    this.redrawVexflow(this.props);
  }

  render() {
    const style = {
      width: '100%',
    };

    return (
      <div ref={(el) => this.vexflowEl = el}
           style={style}>
      </div>
    );
  }
}
