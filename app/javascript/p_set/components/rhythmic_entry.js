import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';

export default class RhythmicEntryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.addMeasure = this.addMeasure.bind(this);
    this.state = {
      currentMeasure: 0,
    };
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    score: PropTypes.array.isRequired,
    meter: PropTypes.object.isRequired,
    clef: PropTypes.string.isRequired,
    updateScore: PropTypes.func.isRequired
  }

  addMeasure() {
    const score = Object.assign({}, this.props.score);
    score.push({
      notes: []
    });
    this.updateScore(score);
  }

  currentMeasure() {
    const { score } = this.props;
    return score.length ?
      score[score.length - 1] : null;
  }



  render() {
    const [notes, rests] = _.partition(this.props.options, ([note, _]) => {
      return !note.endsWith('r');
    });
    function makeButton(duration) {
      return (
        <input key={duration}
               type="submit"
               className="button"
               value={duration} />
      );
    }
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
                              currentMeasure={this.state.currentMeasure} />
          </div>
          <div className="row">
            <div className="large-4 columns">
              <form>
                <fieldset>
                  <legend>Measure ({this.state.currentMeasure + 1})</legend>
                  <input type="submit"
                         className="button"
                         value="Prev"
                         onClick={this.addMeasure} />
                  <input type="submit"
                         className="button"
                         value="Next" />
                </fieldset>
                <fieldset>
                  <legend>Notes</legend>
                  <p>
                    <input type="checkbox" value="dotted" id="dotted" />
                    <label htmlFor="dotted">Dot note</label>
                  </p>
                  {noteButtons}
                </fieldset>
                <fieldset>
                  <legend>Rests</legend>
                  {restButtons}
                </fieldset>
                <fieldset>
                  <input type="submit" className="button" value="Undo" />
                </fieldset>
              </form>
            </div>
            <div className="large-4 columns">
              <form>
                <fieldset>
                  <legend>Dotting</legend>
                  <input type="submit" className="button" value="Toggle" />
                </fieldset>
              </form>
            </div>
            <div className="large-4 columns">
              <form>
                <fieldset>
                  <legend>Proceed to Melody</legend>
                  <input type="submit" className="button" value="Save and Continue" />
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
