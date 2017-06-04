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

export default class MelodicEntryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      octave: 0
    };
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    stave: PropTypes.object.isRequired,
    meter: PropTypes.object.isRequired,
    updateStave: PropTypes.func.isRequired,
    updatePosition: PropTypes.func.isRequired
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

    this.props.updateStave(newAnswer);

    this.setState({
      octave
    });
  }

  getErrors() {
    const { currentMeasure, currentNote } = this.props;
    const measure = this.props.stave.answer[currentMeasure];
    const { notes } = measure;
    const solutionMeasure = this.props.stave.solution[currentMeasure];
    const solutionNotes = solutionMeasure.notes;
    if (notes.length > 0) {
      if (notes.length > solutionNotes.length) {
        return 'Too many notes!';
      }

      const note = notes[currentNote];
      const solution = solutionNotes[currentNote];

      let error = '';
      if (note.solfege !== solution.solfege) {
        error += 'Wrong solfege selection. ';
      }
      if (note.octave !== solution.octave) {
        error += 'Wrong octave selection. ';
      }
      if (note.duration !== solution.duration) {
        error += 'Wrong note duration!';
      }

      return error;
    }
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

    this.props.updateStave(newAnswer);
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
  }

  render() {
    const { currentMeasure, currentNote } = this.props;
    const startMeasure = Math.floor(currentMeasure / 4) * 4;
    const measure = this.props.stave.answer[currentMeasure];
    const measureNotes = measure.notes;
    const note = measureNotes[currentNote];
    const noteDisplay = `Note (${currentNote + 1}/${measureNotes.length})`;
    const solfege = this.props.options.filter(([_, v]) => v).map(([v, _]) => v);
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

    if (!_.isUndefined(this.solfegeInput)) {
      this.solfegeInput.focus();
    }

    return (
      <div className="row columns">
        <div className="reveal" id="help-text" data-reveal>
          <ul>
            <li><b>Right/left</b> arrows change current note</li>
            <li><b>Up/down</b> arrows select solfege</li>
            <li><b>+/-</b> raise or lower an octave</li>
          </ul>
        </div>
        <div className="row columns">
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
        <div className="row columns">
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
