import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Vex from 'vexflow';

const VF = Vex.Flow;

export default class VexflowComponent extends React.Component {
  constructor(props) {
    super(props);

    this.renderer = null;
    this.convertNote = this.convertNote.bind(this);
  }

  static propTypes = {
    score: PropTypes.array.isRequired,
    answer: PropTypes.array.isRequired,
    meter: PropTypes.object.isRequired,
    clef: PropTypes.string.isRequired
  }

  meterToString() {
    return `${this.props.meter.top}/${this.props.meter.bottom}`;
  }

  convertNote(note) {
    const { type } = note;

    if (type === 'note') {
      const { keys, duration } = note;
      return new VF.StaveNote({
        duration: duration,
        keys: keys,
        clef: this.props.clef
      });
    } else if (type === 'barline') {
      let { barType } = note;
      barType = VF.Barline.type[barType];
      return new VF.Barline(barType);
    } else if (type === 'beam') {
      let {notes} = note;
      notes = notes.map(this.convertNote);
      const beam = new VF.Beam(notes);
      return [notes, beam];
    }
  }

  scoreToVoice() {
    const context = this.renderer.getContext();

    const voice = new VF.Voice({
      num_beats: this.props.meter.top,
      beat_value: this.props.meter.bottom
    })
    voice.setMode(VF.Voice.Mode.SOFT);

    const results = _.flattenDeep(this.props.score.map(this.convertNote));
    const [notes, beams] = _.partition(results, (x) => {
      return x instanceof VF.StaveNote;
    });

    voice.addTickables(notes);
    const formatter = new VF.Formatter()
      .joinVoices([voice])
      .format([voice], 400);

    return [voice, beams];
  }

  redrawVexflow() {
    const context = this.renderer.getContext();

    // reset major pros
    this.stave.addClef(this.props.clef)
    this.stave.addTimeSignature(this.meterToString());
    this.stave.resetLines();

    const [voice, beams] = this.scoreToVoice();
    voice.draw(context, this.stave);
    beams.forEach((b) => b.setContext(context).draw());

    this.stave.draw();
  }

  componentDidMount() {
    const e = ReactDOM.findDOMNode(this.refs.vexflow);
    const containerWidth = e.offsetWidth;

    this.renderer = new VF.Renderer(e, VF.Renderer.Backends.SVG);
    this.renderer.resize(containerWidth, 150);

    const context = this.renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");
    this.stave = new VF.Stave(0, 0, containerWidth);
    this.stave.setContext(context);

    this.redrawVexflow();
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
