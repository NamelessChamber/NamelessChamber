import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';

export default class RhythmicEntryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentMeasure: 0,
      dotted: false
    };
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    stave: PropTypes.object.isRequired,
    updateScore: PropTypes.func.isRequired,
    meter: PropTypes.object.isRequired,
    save: PropTypes.func.isRequired
  }

  setCurrentMeasure(increment, e) {
    e.preventDefault();
    let { currentMeasure } = this.state;

    if (increment) {
      const scoreLength = this.props.stave.answer.length - 1;
      currentMeasure = Math.min(scoreLength, currentMeasure + 1);
    } else {
      currentMeasure = Math.max(0, currentMeasure - 1);
    }

    this.setState({
      currentMeasure
    });
  }

  appendNote(duration, e) {
    e.preventDefault();

    const newNote = {
      type: 'note',
      duration: duration,
      dotted: this.state.dotted
    };

    const newAnswer = _.cloneDeep(this.props.stave.answer);
    const measure = newAnswer[this.state.currentMeasure];
    measure.notes.push(newNote);

    this.props.updateScore(newAnswer);
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

    const newAnswer = _.cloneDeep(this.props.stave.answer);
    const { currentMeasure } = this.state;
    const measure = newAnswer[currentMeasure];
    measure.notes = _.dropRight(measure.notes);

    this.props.updateScore(newAnswer);
    this.setState({dotted: false});
  }

  getErrors() {
    const { stave } = this.props;
    const measure = stave.answer[this.state.currentMeasure];
    const { notes } = measure;
    const solutionMeasure = stave.solution[this.state.currentMeasure];
    const solutionNotes = solutionMeasure.notes;
    if (notes.length > 0) {
      if (notes.length > solutionNotes.length) {
        return 'Too many notes!';
      }

      const note = _.last(notes);
      const solution = solutionNotes[notes.length - 1];

      let error = '';
      if (note.duration !== solution.duration) {
        error += 'Wrong note type/duration! ';
      }

      return error;
    }
  }

  render() {
    const [notes, rests] = _.partition(this.props.options, ([note, _]) => {
      return !note.endsWith('r');
    });
    const makeButton = (duration) => {
        return (
        <input key={duration}
               type="submit"
               className="button"
               value={duration}
               onClick={this.appendNote.bind(this, duration)} />
      );
    };
    const noteButtons =
      notes.filter((x) => x[1]).map(([d, _]) => makeButton(d));
    const restButtons =
      rests.filter((x) => x[1]).map(([d, _]) => makeButton(d));

    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;

    const errors = this.getErrors();

    return (
      <div className="row">
        <div className="small-12 large-8 large-centered">
          <div>
            <VexflowComponent score={this.props.stave.answer}
                              meter={this.props.meter}
                              clef={this.props.stave.clef}
                              rhythmic={true}
                              currentMeasure={this.state.currentMeasure}
                              startMeasure={startMeasure} />
          </div>
          <div className="row">
            <div className="large-4 columns">
              <fieldset>
                <legend>Measure ({this.state.currentMeasure + 1}/{this.props.stave.answer.length})</legend>
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
                <legend>Notes</legend>
                <p>
                  <input type="checkbox"
                    value="dotted"
                    id="dotted"
                    checked={this.state.dotted}
                    onChange={this.toggleDotted.bind(this)} />
                  <label htmlFor="dotted">Dot note</label>
                </p>
                {noteButtons}
              </fieldset>
              <fieldset>
                <legend>Rests</legend>
                {restButtons}
              </fieldset>
              <fieldset>
                <legend>Delete</legend>
                <input type="submit"
                  className="button"
                  value="Delete"
                  onClick={this.removeNote.bind(this)} />
              </fieldset>
            </div>
            <div className="large-4 columns">
              <fieldset>
                <legend>{errors}</legend>
              </fieldset>
            </div>
            <div className="large-4 columns">
              <fieldset>
                <legend>Proceed to Melody</legend>
                <input type="submit"
                  className="button"
                  value="Save and Continue"
                  onClick={this.props.save}/>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
