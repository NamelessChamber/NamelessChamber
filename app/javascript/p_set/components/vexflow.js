import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Vex from 'vexflow';

const VF = Vex.Flow;

const BAR_TYPES = {
  single: VF.Barline.type.SINGLE,
  double: VF.Barline.type.DOUBLE,
  end: VF.Barline.type.END,
};

export default class VexflowComponent extends React.Component {
  constructor(props) {
    super(props);

    this.renderer = null;
  }

  static propTypes = {
    score: PropTypes.array.isRequired,
    meter: PropTypes.object.isRequired,
    clef: PropTypes.string.isRequired,
    rhythmic: PropTypes.bool,
    currentMeasure: PropTypes.number,
    startMeasure: PropTypes.number,
    numMeasures: PropTypes.number,
    keySignature: PropTypes.string,
    currentNote: PropTypes.number
  }

  static defaultProps = {
    rhythmic: false,
    startMeasure: 4,
    numMeasures: 4
  }

  meterToString() {
    return `${this.props.meter.top}/${this.props.meter.bottom}`;
  }

  defaultLineForStave() {
    return ['b/4'];
  }

  convertNote(props, highlight, note, i) {
    const { type } = note;

    if (type === 'note') {
      const { keys, duration } = note;

      const staveNote = new VF.StaveNote({
        duration: duration,
        keys: props.rhythmic ? this.defaultLineForStave() : keys,
        clef: props.clef
      });

      if (highlight && _.isNumber(props.currentNote)) {
        if (i === props.currentNote) {
          const annotation = new VF.Annotation('▲')
            .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
          staveNote.addModifier(0, annotation);
        }
      }

      if (note.dotted) {
        staveNote.addDotToAll();
      }

      if (note.accidental) {
        staveNote.addAccidental(0, new VF.Accidental(note.accidental));
      }

      return staveNote;
    }
  }

  scoreToVoice(props, score, width, highlight) {
    const context = this.renderer.getContext();

    const voice = new VF.Voice({
      num_beats: this.props.meter.top,
      beat_value: this.props.meter.bottom
    })
    voice.setMode(VF.Voice.Mode.SOFT);

    const notes = _.flattenDeep(
      score.map(
        this.convertNote.bind(this, props, highlight)
      )
    );
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
    const staveOptions = props.rhythmic ?
      {num_lines: 0} : undefined;

    function scoreLength(score) {
      return score.reduce((acc, item) => {
        if (item.type === 'note') {
          return acc + 1;
        } else if (item.type === 'beam') {
          return acc + scoreLength(item.notes);
        }
      }, 0);
    }

    this.staves = [];
    let lastStave = null;
    let widthOffset = 0;

    const scoreSlice = _.slice(
      props.score,
      props.startMeasure,
      props.startMeasure + props.numMeasures
    );
    scoreSlice.forEach((score, i) => {
      i += props.startMeasure;
      const { notes } = score;
      let width = scoreLength(notes) * 40;
      if (width === 0) {
        width = 50;
      }
      let offsetIncrement = width;

      if (i === 0) {
        // clef
        offsetIncrement += 100;
      }

      const stave = new VF.Stave(widthOffset, 0, offsetIncrement, staveOptions);
      stave.setContext(context);

      if (score.endBar) {
        stave.setEndBarType(BAR_TYPES[score.endBar]);
      }


      let section = `${i + 1}`;
      let highlight = false;
      if (i === props.currentMeasure) {
        highlight = true
        section = `▼${section}`;
      }
      stave.setSection(section, 0);

      if (i === 0) {
        stave.addClef(props.clef).addTimeSignature(this.meterToString());
        if (props.keySignature) {
          stave.addKeySignature(props.keySignature);
        }
      }

      const [voice, beams] = this.scoreToVoice(props, notes, width, highlight);
      voice.draw(context, stave);
      beams.forEach((b) => b.setContext(context).draw());

      stave.draw();

      widthOffset += offsetIncrement;
      this.staves.push(stave);
    });
  }

  shouldComponentUpdate() {
    return true;
  }

  componentWillReceiveProps(newProps) {
    this.redrawVexflow(newProps);
  }

  componentDidMount() {
    const e = ReactDOM.findDOMNode(this.refs.vexflow);
    const containerWidth = e.offsetWidth;

    this.renderer = new VF.Renderer(e, VF.Renderer.Backends.SVG);
    this.renderer.resize(containerWidth, 200);

    const context = this.renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    this.redrawVexflow(this.props);
  }

  render() {
    const style = {
      width: '100%'
    };

    return (
      <div ref="vexflow" style={style}>
      </div>
    );
  }
}
