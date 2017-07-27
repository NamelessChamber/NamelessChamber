import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import ReactAudioPlayer from 'react-audio-player';

import VexflowComponent from './vexflow';
import { formatKey } from '../lib/models';

const clefToOctave = (clef) => {
  if (clef === 'treble') {
    return 4;
  } else if (clef === 'bass') {
    return 3;
  }
};

const staveComplete = (stave) => {
  return _.every(stave.answer, (measure) => {
    return _.every(measure.notes, (note) => {
      return _.endsWith(note.duration, 'r') ||
        (!_.isUndefined(note.solfege) && !_.isUndefined(note.octave));
    });
  });
};

export default class MelodicEntryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      octave: 0,
      keySignature: props.keySignature
    };

    this.updateKey = this.updateKey.bind(this);
  }

  static propTypes = {
    options: PropTypes.object.isRequired,
    stave: PropTypes.object.isRequired,
    staveId: PropTypes.number.isRequired,
    keySignature: PropTypes.string,
    updateStave: PropTypes.func.isRequired,
    updatePosition: PropTypes.func.isRequired,
    updateKeySignature: PropTypes.func.isRequired,
    currentMeasure: PropTypes.number.isRequired,
    currentNote: PropTypes.number.isRequired,
    save: PropTypes.func.isRequired,
    reportErrors: PropTypes.func,
    complete: PropTypes.func.isRequired,
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

  setCurrentNote(increment, e) {
    e.preventDefault();
    let { currentNote, currentMeasure } = this.props;
    const staveLength = this.measures.length;
    const measure = this.measures[currentMeasure];
    const { notes } = measure;

    if (increment) {
      const measureLength = notes.length - 1;
      if (currentNote + 1 > measureLength) {
        if (currentMeasure + 1 < staveLength &&
            this.measures[currentMeasure + 1].notes.length > 0) {
          currentMeasure += 1;
          currentNote = 0;
        }
      } else {
        currentNote += 1;
      }
    } else {
      if (currentNote - 1 >= 0) {
        currentNote -= 1;
      } else {
        if (currentMeasure - 1 >= 0) {
          currentMeasure -= 1;
          const measureLength = this.measures[currentMeasure].notes.length;
          currentNote = measureLength - 1;
        }
      }
    }

    this.props.updatePosition({
      currentNote,
      currentMeasure
    });
  }

  setOctave(increment, e) {
    let { octave } = this.state;

    if (increment) {
      octave += 1;
    } else {
      octave -= 1;
    }

    const measures = _.cloneDeep(this.measures);
    const note = this.currentNote(measures);
    note.octave = octave;

    this.props.updateStave(measures);

    this.setState({
      octave
    });
  }

  currentNote(score) {
    const measure = score[this.props.currentMeasure];
    const { notes } = measure;
    return notes[this.props.currentNote];
  }

  noteChange(e) {
    const solfege = e.target.value;
    const measures = _.cloneDeep(this.measures);
    const note = this.currentNote(measures);
    let { octave } = this.state;
    if (_.isString(octave)) {
      octave = parseInt(octave);
    }
    note.solfege = solfege;
    note.octave = octave;

    this.props.updateStave(measures);
  }

  handleKeyDown(e) {
    switch(e.key) {
      case 'ArrowRight':
        this.setCurrentNote(true, e);
        break;
      case 'ArrowLeft':
        this.setCurrentNote(false, e);
        break;
      case '+':
        this.setOctave(true, e);
        break;
      case '-':
      this.setOctave(false, e);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        break;
    }
  }

  componentDidMount() {
    this.solfegeInput.focus();
    $(this.containerEl).foundation();
  }

  componentDidUpdate() {
    this.solfegeInput.focus();
    $(this.containerEl).foundation();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.staveId != this.props.staveId) {
      this.setState({octave: newProps.stave.tonic.octave});
    }
  }

  updateKey(e) {
    const keySignature = e.target.value;
    this.setState({keySignature});
  }

  checkWork() {
    if (staveComplete(this.props.stave)) {
      this.props.reportErrors();
    } else {
      this.props.reportErrors(['Must complete melodic entry before checking work']);
    }
  }

  render() {
    const { currentMeasure, currentNote } = this.props;
    const measure = this.measures[currentMeasure];
    const measureNotes = measure.notes;
    const note = measureNotes[currentNote];
    const noteDisplay = `Note (${currentNote + 1}/${measureNotes.length})`;
    const solfege = this.props.options.solfege.filter(([_, v]) => v).map(([v, _]) => v);
    let selectedSolfege = _.isUndefined(note) ?
      '' : note.solfege;
    let octaveStr = this.state.octave.toString();
    if (this.state.octave > 0) {
      octaveStr = '+' + octaveStr;
    }
    const solfegeOptions = solfege.map((s) => {
      return (
        <option key={s} value={s}>{s}</option>
      );
    });

    const keyCorrect = this.props.keySignature === this.props.stave.tonic.pitch;
    const keyOptions = this.props.options.key
                           .filter(([_, v]) => v)
                           .map(([key, _], i) => {
      return (
        <option key={i} value={key}>{formatKey(key)}</option>
      );
    });
    keyOptions.unshift((<option key="null" value={undefined}>-</option>));
    const { instructor } = this.props;
    const showIf = (cond) => {
      return cond ?
        {} : {display: 'none'};
    };
    const audios = this.props.stave.audios.melody.map(({name, url}, i) => {
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
        <div className="reveal" id="help-text-melodic" data-reveal>
          <ul>
            <li><b>Right/left</b> arrows change current note</li>
            <li><b>Up/down</b> arrows select solfege</li>
            <li><b>Shift-+/-</b> raise or lower an octave</li>
          </ul>
        </div>
        <div className="row columns" style={showIf(!keyCorrect && !instructor)}>
          <fieldset>
            <legend>Key</legend>
            <select value={this.state.keySignature}
                    onChange={this.updateKey}>
              {keyOptions}
            </select>
            <button className="button"
                    onClick={(e) => this.props.updateKeySignature(this.state.keySignature)}>
              Verify
            </button>
          </fieldset>
        </div>
        <div className="row columns" style={showIf(keyCorrect || instructor)}>
          <fieldset>
            <legend>Solfege</legend>
            <select multiple
                    ref={(input) => this.solfegeInput = input}
                    onBlur={(e) => e.target.focus()}
                    onKeyDown={this.handleKeyDown.bind(this)}
                    style={{width: '75px', height: '230px'}}
                    value={[selectedSolfege]}
                    onChange={this.noteChange.bind(this)}>
              {solfegeOptions}
            </select>
          </fieldset>
        </div>
        <div className="row columns" style={showIf(keyCorrect && !instructor)}>
          <fieldset>
            <legend>Check Work</legend>
            <input type="submit"
              className="button"
              value="Check"
              onClick={() => this.checkWork()}/>
          </fieldset>
        </div>
        <div className="row columns" style={showIf(keyCorrect || instructor)}>
          <fieldset>
            <legend>Proceed to Harmony</legend>
            <Link className="button" to="harmony">Save and Continue</Link>
          </fieldset>
          <fieldset>
            <legend>Return to Rhythm</legend>
            <Link className="button" to="rhythm">Back</Link>
          </fieldset>
          <fieldset style={showIf(!instructor)}>
            <legend>Save</legend>
            <input type="submit"
              className="button"
              value="Save"
              onClick={this.props.complete} />
          </fieldset>
          <fieldset>
            <legend>Keyboard Hints</legend>
            <button data-open="help-text-melodic" className="button">
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
