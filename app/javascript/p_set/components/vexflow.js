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
    this.convertNote = this.convertNote.bind(this);
  }

  static propTypes = {
    score: PropTypes.array.isRequired,
    meter: PropTypes.object.isRequired,
    clef: PropTypes.string.isRequired,
    rhythmic: PropTypes.bool,
    currentMeasure: PropTypes.number
  }

  static defaultProps = {
    rhythmic: false
  }

  meterToString() {
    return `${this.props.meter.top}/${this.props.meter.bottom}`;
  }

  defaultLineForStave() {
    return ['b/4'];
  }

  convertNote(note) {
    const { type } = note;

    if (type === 'note') {
      const { keys, duration } = note;

      const staveNote = new VF.StaveNote({
        duration: duration,
        keys: this.props.rhythmic ? this.defaultLineForStave() : keys,
        clef: this.props.clef
      });

      if (note.dotted) {
        staveNote.addDotToAll();
      }

      if (note.accidental) {
        staveNote.addAccidental(0, new VF.Accidental(note.accidental));
      }

      return staveNote;
    } else if (type === 'beam') {
      let {notes} = note;
      notes = notes.map(this.convertNote);
      const beam = new VF.Beam(notes);
      return [notes, beam];
    }
  }

  scoreToVoice(score, width) {
    const context = this.renderer.getContext();

    const voice = new VF.Voice({
      num_beats: this.props.meter.top,
      beat_value: this.props.meter.bottom
    })
    voice.setMode(VF.Voice.Mode.SOFT);

    const notes = _.flattenDeep(score.map(this.convertNote));
    const beams = VF.Beam.generateBeams(notes);

    voice.addTickables(notes);
    const formatter = new VF.Formatter()
      .joinVoices([voice])
      .format([voice], width);

    return [voice, beams];
  }

  redrawVexflow(props) {
    const context = this.renderer.getContext();
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

    props.score.forEach((score, i) => {
      const { notes } = score;
      let width = scoreLength(notes) * 50;
      if (width === 0) {
        width = 50;
      }
      let offsetIncrement = width;

      if (i === 0) {
        // clef
        offsetIncrement += 50;
      }

      const stave = new VF.Stave(widthOffset, 0, offsetIncrement, staveOptions);
      stave.setContext(context);

      if (score.endBar) {
        stave.setEndBarType(BAR_TYPES[score.endBar]);
      }

      if (i === props.currentMeasure) {
        stave.setSection('▼', 0);
      }

      if (i === 0) {
        stave.addClef(props.clef).addTimeSignature(this.meterToString());
      }

      const [voice, beams] = this.scoreToVoice(notes, width);
      voice.draw(context, stave);
      beams.forEach((b) => b.setContext(context).draw());

      stave.draw();

      widthOffset += offsetIncrement;
      this.staves.push(stave);
    });
  }

  componentWillReceiveProps(newProps) {
    this.redrawVexflow(newProps);
  }

  componentDidMount() {
    const e = ReactDOM.findDOMNode(this.refs.vexflow);
    const containerWidth = e.offsetWidth;

    this.renderer = new VF.Renderer(e, VF.Renderer.Backends.SVG);
    this.renderer.resize(containerWidth, 150);

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
