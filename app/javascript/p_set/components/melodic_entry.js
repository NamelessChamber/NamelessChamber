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
      octave: clefToOctave(props.clef),
      key: props.keys[0] || 'C'
    };
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    score: PropTypes.array.isRequired,
    solution: PropTypes.array.isRequired,
    meter: PropTypes.object.isRequired,
    clef: PropTypes.string.isRequired,
    updateScore: PropTypes.func.isRequired,
    keys: PropTypes.array.isRequired
  }

  setCurrentMeasure(increment, e) {
    e.preventDefault();
    let { currentMeasure } = this.state;

    if (increment) {
      const scoreLength = this.props.score.length - 1;
      currentMeasure = Math.min(scoreLength, currentMeasure + 1);
    } else {
      currentMeasure = Math.max(0, currentMeasure - 1);
    }

    this.setState({
      currentMeasure,
      currentNote: 0
    });
  }

  setCurrentNote(increment, e) {
    e.preventDefault();
    let { currentNote } = this.state;
    const measure = this.props.score[this.state.currentMeasure];
    const { notes } = measure;

    if (increment) {
      const measureLength = notes.length - 1;
      currentNote = Math.min(measureLength, currentNote + 1);
      currentNote = Math.max(currentNote, 0);
    } else {
      currentNote = Math.max(0, currentNote - 1);
    }

    this.setState({
      currentNote
    });
  }

  setOctave(increment, e) {
    let { octave } = this.state;

    if (increment) {
      octave += 1;
    } else {
      octave = Math.max(1, octave - 1);
    }

    const newScore = _.cloneDeep(this.props.score);
    const note = this.currentNote(newScore);
    note.octave = octave;

    this.props.updateScore(newScore);

    this.setState({
      octave
    });
  }

  getErrors() {
    const measure = this.props.score[this.state.currentMeasure];
    const { notes } = measure;
    const solutionMeasure = this.props.solution[this.state.currentMeasure];
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
    const newScore = _.cloneDeep(this.props.score);
    const note = this.currentNote(newScore);
    note.solfege = solfege;
    note.octave = this.state.octave;

    this.props.updateScore(newScore);
  }

  updateKey(e) {
    const key = e.target.value;
    this.setState({key});
  }

  render() {
    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;
    const measure = this.props.score[this.state.currentMeasure];
    const measureNotes = measure.notes;
    const note = measureNotes[this.state.currentNote];
    const noteDisplay = `Note (${this.state.currentNote + 1}/${measureNotes.length})`;
    const solfege = this.props.options.filter(([_, v]) => v).map(([v, _]) => v);
    let selectedSolfege = _.isUndefined(note) ?
      undefined : note.solfege;
    if (_.isUndefined(selectedSolfege)) {
      selectedSolfege = '';
    }
    const solfegeOptions = solfege.map((s) => {
      return (
        <option key={s} value={s}>{s}</option>
      );
    });

    const keyOptions = this.props.keys.map((key) => {
      return (
        <option key={key} value={key}>{key}</option>
      );
    });

    const errors = this.getErrors();

    return (
      <div className="row">
        <div className="small-12 large-8 large-centered">
          <div>
            <VexflowComponent score={this.props.score}
                              meter={this.props.meter}
                              clef={this.props.clef}
                              rhythmic={false}
                              keySignature={this.state.key}
                              currentMeasure={this.state.currentMeasure}
                              startMeasure={startMeasure}
                              currentNote={this.state.currentNote} />
          </div>
          <div className="row">
            <div className="large-4 columns">
              <fieldset>
                <legend>Measure ({this.state.currentMeasure + 1})</legend>
                <input type="submit"
                       className="button"
                       value="Prev"
                       onClick={this.setCurrentMeasure.bind(this, false)} />
                <input type="submit"
                       className="button"
                       value="Next"
                       onClick={this.setCurrentMeasure.bind(this, true)} />
              </fieldset>
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
                <legend>Key</legend>
                <select value={this.state.key}
                        onChange={this.updateKey.bind(this)}>
                  {keyOptions}
                </select>
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
                <legend>Solfege</legend>
                <select multiple
                        style={{width: '75px', height: '230px'}}
                        value={[selectedSolfege]}
                        onChange={this.noteChange.bind(this)}>
                  {solfegeOptions}
                </select>
              </fieldset>
            </div>
            <div className="large-4 columns">
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
                <legend>Complete</legend>
                <input type="submit" className="button" value="Complete" />
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
