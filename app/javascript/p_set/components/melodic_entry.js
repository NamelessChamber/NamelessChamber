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
      currentMeasure: 0,
      currentNote: 0,
      octave: 0
    };
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    stave: PropTypes.object.isRequired,
    meter: PropTypes.object.isRequired,
    updateScore: PropTypes.func.isRequired
  }

  setCurrentNote(increment, e) {
    e.preventDefault();
    let { currentNote, currentMeasure } = this.state;
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

    this.setState({
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

    this.props.updateScore(newAnswer);

    this.setState({
      octave
    });
  }

  getErrors() {
    const measure = this.props.stave.answer[this.state.currentMeasure];
    const { notes } = measure;
    const solutionMeasure = this.props.stave.solution[this.state.currentMeasure];
    const solutionNotes = solutionMeasure.notes;
    if (notes.length > 0) {
      if (notes.length > solutionNotes.length) {
        return 'Too many notes!';
      }

      const note = notes[this.state.currentNote];
      const solution = solutionNotes[this.state.currentNote];

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
    const measure = score[this.state.currentMeasure];
    const { notes } = measure;
    return notes[this.state.currentNote];
  }

  noteChange(e) {
    const solfege = e.target.value;
    const newAnswer = _.cloneDeep(this.props.stave.answer);
    const note = this.currentNote(newAnswer);
    note.solfege = solfege;
    note.octave = this.state.octave;

    this.props.updateScore(newAnswer);
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowRight') {
      this.setCurrentNote(true, e);
    } else if (e.key === 'ArrowLeft') {
      this.setCurrentNote(false, e);
    } else if (e.key === '+') {
      this.setOctave(true, e);
    } else if (e.key === '-') {
      this.setOctave(false, e);
    }
  }

  componentDidMount() {
    this.solfegeInput.focus();
  }

  render() {
    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;
    const measure = this.props.stave.answer[this.state.currentMeasure];
    const measureNotes = measure.notes;
    const note = measureNotes[this.state.currentNote];
    const noteDisplay = `Note (${this.state.currentNote + 1}/${measureNotes.length})`;
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

    const errors = this.getErrors();

    if (!_.isUndefined(this.solfegeInput)) {
      this.solfegeInput.focus();
    }

    return (
      <div className="row">
        <div className="small-12">
          <div>
            <VexflowComponent score={this.props.stave.answer}
                              meter={this.props.meter}
                              clef={this.props.stave.clef}
                              rhythmic={false}
                              tonic={this.props.stave.tonic}
                              scale={this.props.stave.scale}
                              currentMeasure={this.state.currentMeasure}
                              startMeasure={startMeasure}
                              currentNote={this.state.currentNote} />
          </div>
          <div className="row">
            <div className="large-4 columns">
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
            <div className="large-4 columns">
             <fieldset>
                <legend>{noteDisplay}</legend>
                <input type="submit"
                       className="button"
                       value="Prev"
                       onClick={this.setCurrentNote.bind(this, false)} />
                <input type="submit"
                       className="button"
                       value="Next"
                       onClick={this.setCurrentNote.bind(this, true)} />
              </fieldset>
              <fieldset>
                <legend>Octave {this.state.octave}</legend>
                <input type="submit"
                       className="button"
                       value="Down"
                       onClick={this.setOctave.bind(this, false)} />
                <input type="submit"
                       className="button"
                       value="Up"
                       onClick={this.setOctave.bind(this, true)} />
              </fieldset>
              <fieldset>
                <legend>{errors}</legend>
              </fieldset>
            </div>
            <div className="large-4 columns">
              <fieldset>
                <legend>Return</legend>
                <input type="submit"
                       className="button"
                       value="Back to Rhythm"
                       onClick={this.props.save} />
              </fieldset>
              <fieldset>
                <legend>Save</legend>
                <input type="submit"
                  className="button"
                  value="Save"
                  onClick={this.props.complete} />
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
