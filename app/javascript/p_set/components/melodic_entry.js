import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import ReactAudioPlayer from 'react-audio-player';

import VexflowComponent from './vexflow';
import { formatKey, nextNonEmptyMeasure, prevNonEmptyMeasure, keyOptionToSignature, getVFScaleName, changeAudioPlayerState } from '../lib/utils';

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
    measures: PropTypes.array.isRequired,
    staveId: PropTypes.number.isRequired,
    keySignature: PropTypes.string,
    updateStave: PropTypes.func.isRequired,
    changeStave: PropTypes.func.isRequired,
    updatePosition: PropTypes.func.isRequired,
    updateKeySignature: PropTypes.func.isRequired,
    currentMeasure: PropTypes.number.isRequired,
    currentNote: PropTypes.number.isRequired,
    save: PropTypes.func.isRequired,
    instructor: PropTypes.bool
  }

  static defaultProps = {
    instructor: true
  }

  getMeasures(props = this.props) {
    return props.measures;
  }

  get measures() {
    return this.getMeasures();
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
        if (currentMeasure + 1 < staveLength) {
          currentMeasure = Math.max(
            currentMeasure,
            nextNonEmptyMeasure(this.measures, currentMeasure + 1)
          );
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
          const prev = prevNonEmptyMeasure(this.measures, currentMeasure);
          if (prev >= 0) {
            currentMeasure = prev;
            const measureLength = this.measures[currentMeasure].notes.length;
            currentNote = measureLength - 1;
          }
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

    const { currentMeasure, currentNote } = this.props;
    this.props.updateStave(measures, currentMeasure, currentNote);

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

    const { currentMeasure, currentNote } = this.props;
    this.props.updateStave(measures, currentMeasure, currentNote);
  }

  handleKeyDown(e) {
    switch(e.key) {
      case '<':
      case '>':
        this.props.changeStave(e, true);
        break;
      case ' ':
        changeAudioPlayerState();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        if (!this.props.instructor) {
          e.preventDefault();
        }
        break;
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
    const stateUpdate = {};

    if (newProps.staveId != this.props.staveId) {
      stateUpdate.octave = 0;
    }

    if (newProps.currentMeasure !== this.props.currentMeasure ||
        newProps.currentNote !== this.props.currentNote) {
      const newMeasures = _.cloneDeep(newProps.measures);
      const oldNote = this.currentNote(this.measures);
      const note = newMeasures[newProps.currentMeasure].notes[newProps.currentNote];
      if (_.isUndefined(note.solfege)) {
        note.solfege = oldNote.solfege;
        note.octave = oldNote.octave;
        newProps.updateStave(newMeasures, newProps.currentMeasure, newProps.currentNote);
      }
    }

    if (!_.isEmpty(stateUpdate)) {
      this.setState(stateUpdate);
    }
  }

  updateKey(e) {
    const keySignature = e.target.value;
    this.setState({keySignature});
  }

  render() {
    const { currentMeasure, currentNote } = this.props;
    const measure = this.measures[currentMeasure];
    const measureNotes = measure.notes;
    const note = measureNotes[currentNote];
    const noteDisplay = `Note (${currentNote + 1}/${measureNotes.length})`;
    const solfege =
      this.props.options.solfege
        .filter(([_, v]) => v)
        .map(([v, _]) => v)
        .reverse();
    let selectedSolfege = _.isUndefined(note) ?
      '' : note.solfege;
    let octaveStr = this.state.octave.toString();
    if (this.state.octave > 0) {
      octaveStr = '+' + octaveStr;
    }
    let solfegeOptions = solfege.map((s) => {
      return (
        <option key={s} value={s}>{s}</option>
      );
    });
    // rests can't have pitch set
    if (note && note.duration && note.duration.match(/r$/)) {
      solfegeOptions = [];
    }

    const keySignature = keyOptionToSignature(this.props.keySignature);
    const keyCorrect = keySignature === getVFScaleName(this.props.stave.tonic, this.props.stave.scale);
    const keyOptions = this.props.options.key
                           .filter(([_, v]) => v)
                           .map(([key, _], i) => {
      return (
        <option key={i + 1} value={key}>{formatKey(key)}</option>
      );
    });
    keyOptions.unshift((<option key={0} value={''}>-</option>));
    const { instructor } = this.props;
    const showIf = (cond) => {
      return cond ?
        {} : {display: 'none'};
    };

    return (
      <div className="row columns" ref={(el) => this.containerEl = el}>
        <div className="reveal" id="help-text-melodic" data-reveal>
          <ul>
            <li><b>Space</b> plays/pauses the audio</li>
            <li><b>Right/left</b> arrows change current note</li>
            <li><b>Up/down</b> arrows select solfege</li>
            <li><b>Shift-+/-</b> raise or lower an octave</li>
            <li><b>&lt;/&gt;</b> Moves up/down a stave, or cycles around</li>
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
        <div className="row columns" style={showIf(keyCorrect || instructor)}>
          <div>
            <Link className="button" to="harmony">Proceed to Harmony</Link>
          </div>
          <div>
            <Link className="button" to="rhythm">Back to Rhythm</Link>
          </div>
          <div style={showIf(instructor)}>
            <Link className="button" to="options">Back to Options</Link>
          </div>
          <div>
            <button data-open="help-text-melodic" className="button">
              Show Help
            </button>
          </div>
        </div>
      </div>
    );
  }
}
