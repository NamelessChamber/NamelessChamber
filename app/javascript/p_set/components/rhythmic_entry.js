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
      currentMeasure
    });
  }

  appendNote(duration, e) {
    e.preventDefault();

    const newNote = {
      type: 'note',
      duration: duration,
      keys: ['b/4'],
      dotted: this.state.dotted
    };

    const newScore = _.cloneDeep(this.props.score);
    const measure = newScore[this.state.currentMeasure];
    measure.notes.push(newNote);

    this.props.updateScore(newScore);
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

    const newScore = _.cloneDeep(this.props.score);
    const { currentMeasure } = this.state;
    const measure = newScore[currentMeasure];
    measure.notes = _.dropRight(measure.notes);

    this.props.updateScore(newScore);
    this.setState({dotted: false});
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

    return (
      <div className="row">
        <div className="small-12 large-8 large-centered">
          <div>
            <VexflowComponent score={this.props.score}
                              meter={this.props.meter}
                              clef={this.props.clef}
                              rhythmic={false}
                              keySignature={'F'}
                              currentMeasure={this.state.currentMeasure} />
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
                <legend>Dotting</legend>
                <input type="submit" className="button" value="Toggle" />
              </fieldset>
            </div>
            <div className="large-4 columns">
              <fieldset>
                <legend>Proceed to Melody</legend>
                <input type="submit" className="button" value="Save and Continue" />
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
