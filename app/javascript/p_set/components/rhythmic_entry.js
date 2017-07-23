import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import ReactAudioPlayer from 'react-audio-player';

import VexflowComponent from './vexflow';

require('../styles/rhythmic_entry.css');

export default class RhythmicEntryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      meter: props.meter
    };
  }

  static propTypes = {
    options: PropTypes.object.isRequired,
    stave: PropTypes.object.isRequired,
    referenceMeter: PropTypes.object.isRequired,
    meter: PropTypes.object,
    updateStave: PropTypes.func.isRequired,
    updatePosition: PropTypes.func.isRequired,
    updateMeter: PropTypes.func.isRequired,
    currentMeasure: PropTypes.number.isRequired,
    reportErrors: PropTypes.func,
    save: PropTypes.func.isRequired,
    instructor: PropTypes.bool
  }

  static defaultProps = {
    instructor: true
  }

  get measures() {
    const key = this.props.instructor ?
                'solution' : 'answer';
    return this.props.stave[key];
  }

  setCurrentMeasure(increment, e) {
    e.preventDefault();
    let { currentMeasure } = this.props;

    const measures = this.measures;

    if (increment) {
      const scoreLength = measures.length - 1;
      currentMeasure = Math.min(scoreLength, currentMeasure + 1);
    } else {
      currentMeasure = Math.max(0, currentMeasure - 1);
    }

    this.props.updatePosition({
      currentMeasure
    });
  }

  appendNote(e, rest) {
    e.preventDefault();
    let duration = e.target.value;
    if (rest) {
      duration += 'r';
    }

    const newNote = {
      type: 'note',
      duration: duration,
      dots: 0
    };

    const { currentMeasure } = this.props;
    const measures = _.cloneDeep(this.measures);
    const measure = measures[currentMeasure];
    measure.notes.push(newNote);

    this.props.updateStave(measures, currentMeasure, measure.length - 1);
    this.setState({dotted: false});
  }

  toggleDotted(event) {
    const { checked } = event.target;
    this.setState({
      dotted: checked
    });
  }

  removeNote(event) {
    event.preventDefault();

    const measures = _.cloneDeep(this.measures);
    const { currentMeasure } = this.props;
    const measure = measures[currentMeasure];
    measure.notes = _.dropRight(measure.notes);

    this.props.updateStave(measures, currentMeasure, measure.notes.length);
    this.setState({dotted: false});
  }

  getCurrentNote(measures) {
    const measure = measures[this.props.currentMeasure].notes;
    if (measure.length) {
      return measure[measure.length - 1];
    }
  }

  changeDot(increment) {
    const measures = _.cloneDeep(this.measures);
    const note = this.getCurrentNote(measures);

    if (!_.isUndefined(note)) {
      if (increment) {
        note.dots += 1;
      } else {
        note.dots = Math.max(note.dots - 1, 0);
      }
    }

    const { currentMeasure } = this.props;
    const currentNote = measures[currentMeasure].notes.length - 1;

    this.props.updateStave(measures, currentMeasure, currentNote);
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        this.appendNote(e);
        break;
      case ' ':
        this.appendNote(e, true);
        break;
      case 'Backspace':
      case 'Delete':
        this.removeNote(e);
        break;
      case 'd':
        this.changeDot(true);
        break;
      case 'D':
        this.changeDot(false);
        break;
      case 'ArrowRight':
        this.setCurrentMeasure(true, e);
        break;
      case 'ArrowLeft':
        this.setCurrentMeasure(false, e);
        break;
    }
  }

  noteChange(e) {
    const { value } = e.target;

    this.setState({
      currentNote: value
    });
  }

  updateMeter(pos, e) {
    let value = e.target.value;
    if (_.isString(value)) {
      value = parseInt(value);
    }
    value = Math.max(0, value);

    const meter = Object.assign({}, this.state.meter, {[pos]: value});

    this.setState({
      meter
    });
  }

  componentDidMount() {
    this.noteInput.focus();
    $(this.containerEl).foundation();
  }

  componentDidUpdate() {
    this.noteInput.focus();
    $(this.containerEl).foundation();
  }

  render() {
    const durationString = (duration) => {
      if (duration === '1') {
        return duration;
      } else {
        return `1/${duration}`;
      }
    };
    const noteOptions = this.props.options.rhythm.filter(x => x[1])
      .map(([duration, _], i) => {
        return (
          <option key={i} value={duration}>{durationString(duration)}</option>
        );
      });

    const meterCorrect = _.isEqual(this.props.meter, this.props.referenceMeter);
    const { instructor } = this.props;
    const showIf = (cond) => {
      return cond ?
        {} : {display: 'none'};
    };
    const audios = this.props.stave.audios.rhythm.map(({name, url}, i) => {
      return (
        <li key={i}>
          <p>{name}</p>
          <ReactAudioPlayer src={url}
                            controls />
        </li>
      );
    });

    return (
      <div className="row columns" ref={(el) => this.containerEl = el}>
        <div className="reveal" id="help-text-rhythmic" data-reveal>
          <ul>
            <li><b>Right/left</b> arrows change current measure</li>
            <li><b>Up/down</b> arrows select note duration</li>
            <li><b>Enter</b> adds a note of selected duration</li>
            <li><b>Space</b> adds a rest of selected duration</li>
            <li><b>Backspace/Delete</b> removes the last note in a measure</li>
            <li><b>d</b> adds a dot to the last note in a measure</li>
            <li><b>Shift+d</b> removes a dot from the last note in a measure</li>
          </ul>
        </div>
        <div className="row columns" style={showIf(!meterCorrect && !instructor)}>
          <fieldset>
            <legend>Meter</legend>
            <input type="number"
                   className="meter-entry"
                   onChange={this.updateMeter.bind(this, 'top')}
                   value={this.state.meter.top} />
            /
            <input type="number"
                   className="meter-entry"
                   onChange={this.updateMeter.bind(this, 'bottom')}
                   value={this.state.meter.bottom} />
            <button className="button"
                    onClick={(e) => this.props.updateMeter(this.state.meter)}>
              Verify
            </button>
          </fieldset>
        </div>
        <div className="row columns" style={showIf(meterCorrect || instructor)}>
          <fieldset>
            <legend>Notes</legend>
            <select multiple
                    ref={(input) => this.noteInput = input}
                    onBlur={(e) => e.target.focus()}
                    onKeyDown={this.handleKeyDown.bind(this)}
                    style={{width: '85px', height: '230px'}}
                    value={[this.state.currentNote]}
                    onChange={this.noteChange.bind(this)}>
              {noteOptions}
            </select>
          </fieldset>
          <fieldset>
            <legend>Proceed to Melody</legend>
            <Link to="melody" className="button">
              Save and Continue
            </Link>
          </fieldset>
          <fieldset>
            <legend>Keyboard Hints</legend>
            <button data-open="help-text-rhythmic" className="button">
              Show Help
            </button>
          </fieldset>
        </div>
        <div className="row columns">
          <fieldset>
            <legend>Audio Samples</legend>
            <ul>{audios}</ul>
          </fieldset>
        </div>
      </div>
    );
  }
}
