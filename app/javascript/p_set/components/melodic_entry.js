import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import tonal from 'tonal';
import { fromSemitones } from 'tonal-interval';

import VexflowComponent from './vexflow';

const SolfegeMap = {
  d: 0, r: 2, m: 4, f: 5, s: 7, l: 9, t: 11,
  di: 1, ri: 3, fi: 6, si: 8, li: 10,
  ra: 1, meh: 3, seh: 6, leh: 8, teh: 10
};

const transposeNote = (note, octave, semis) => {
  return tonal.transpose(`${note}${octave}`, fromSemitones(semis));
};

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
      octave: clefToOctave(props.clef)
    };
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    score: PropTypes.array.isRequired,
    meter: PropTypes.object.isRequired,
    clef: PropTypes.string.isRequired,
    updateScore: PropTypes.func.isRequired
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

    const newScore = _.deepCopy(this.props.score);
    const note = this.currentNote(newScore);
    note.octave = note.octave;

    this.props.updateScore(newScore);

    this.setState({
      octave
    });
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
    note.octave = note.octave;

    this.props.updateScore(newScore);
  }

  render() {
    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;
    const measure = this.props.score[this.state.currentMeasure];
    const measureNotes = measure.notes;
    const note = measureNotes[this.state.currentNote];
    const noteDisplay = `Note (${this.state.currentNote + 1}/${measureNotes.length})`;
    const solfege = this.props.options.filter(([_, v]) => v).map(([v, _]) => v);
    const selectedSolfege = _.isUndefined(note) ?
      null : note.solfege;
    const solfegeOptions = solfege.map((s) => {
      return (
        <option key={s} value={s}>{s}</option>
      );
    });

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
                        value={note.solfege}
                        onChange={this.noteChange.bind(this)}>
                  {solfegeOptions}
                </select>
              </fieldset>
            </div>
            <div className="large-4 columns">
              <fieldset>
                <legend>Thing</legend>
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
