import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';

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
    keySignature: PropTypes.string,
    updateStave: PropTypes.func.isRequired,
    updatePosition: PropTypes.func.isRequired,
    updateKeySignature: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    reportErrors: PropTypes.func.isRequired,
    complete: PropTypes.func.isRequired,
  }

  setCurrentNote(increment, e) {
    e.preventDefault();
    let { currentNote, currentMeasure } = this.props;
    const staveLength = this.props.stave.answer.length;
    const measure = this.props.stave.answer[currentMeasure];
    const { notes } = measure;

    if (increment) {
      const measureLength = notes.length - 1;
      if (currentNote + 1 > measureLength) {
        if (currentMeasure + 1 <= staveLength &&
            this.props.stave.answer[currentMeasure + 1].notes.length > 0) {
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
          const measureLength = this.props.stave.answer[currentMeasure].notes.length;
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

    const newAnswer = _.cloneDeep(this.props.stave.answer);
    const note = this.currentNote(newAnswer);
    note.octave = octave;

    const { currentMeasure, currentNote } = this.props;

    this.props.updateStave(newAnswer, currentMeasure, currentNote);

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
    const newAnswer = _.cloneDeep(this.props.stave.answer);
    const note = this.currentNote(newAnswer);
    note.solfege = solfege;
    note.octave = this.state.octave;

    const { currentMeasure, currentNote } = this.props;

    this.props.updateStave(newAnswer, currentMeasure, currentNote);
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
    const measure = this.props.stave.answer[currentMeasure];
    const measureNotes = measure.notes;
    const note = measureNotes[currentNote];
    const noteDisplay = `Note (${currentNote + 1}/${measureNotes.length})`;
    const solfege = this.props.options.solfege.filter(([_, v]) => v).map(([v, _]) => v);
    let selectedSolfege = _.isUndefined(note) ?
      undefined : note.solfege;
    if (_.isUndefined(selectedSolfege)) {
      selectedSolfege = '';
    }
    let octaveStr = this.state.octave.toString();
    if (this.state.octave > 0) {
      octaveStr = '+' + octaveStr;
    }
    const solfegeOptions = solfege.map((s) => {
      return (
        <option key={s} value={s}>{s}</option>
      );
    });

    const keyCorrect = this.props.keySignature === this.props.options.key;
    const keyOptions = this.props.options.keys.map((key, i) => {
      return (
        <option key={i} value={key}>{key}</option>
      );
    });
    const showIf = (cond) => {
      return cond ?
        {} : {display: 'none'};
    };

    return (
      <div className="row columns" ref={(el) => this.containerEl = el}>
        <div className="reveal" id="help-text" data-reveal>
          <ul>
            <li><b>Right/left</b> arrows change current note</li>
            <li><b>Up/down</b> arrows select solfege</li>
            <li><b>Shift-+/-</b> raise or lower an octave</li>
          </ul>
        </div>
        <div className="row columns" style={showIf(!keyCorrect)}>
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
        <div className="row columns" style={showIf(keyCorrect)}>
          <fieldset>
            <legend>Solfege (Octave {octaveStr})</legend>
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
        <div className="row columns" style={showIf(keyCorrect)}>
          <fieldset>
            <legend>Check Work</legend>
            <input type="submit"
              className="button"
              value="Check"
              onClick={() => this.checkWork()}/>
          </fieldset>
          <fieldset>
            <legend>Return to Rhythm</legend>
            <input type="submit"
              className="button"
              value="Back"
              onClick={this.props.save}/>
          </fieldset>
          <fieldset>
            <legend>Save</legend>
            <input type="submit"
              className="button"
              value="Save"
              onClick={this.props.complete} />
          </fieldset>
          <fieldset>
            <legend>Keyboard Hints</legend>
            <button data-open="help-text" className="button">
              Show Help
            </button>
          </fieldset>
        </div>
      </div>
    );
  }
}
