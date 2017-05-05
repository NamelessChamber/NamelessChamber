import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

class RhythmicEntryComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    options: PropTypes.array.isRequired
  }

  render() {
    const [notes, rests] = _.partition(this.props.options, ([note, _]) => {
      return !note.endsWith('r');
    });
    const noteButtons = notes.filter((x) => x[1]);

    return (
      <div className="row">
        <div className="small-12 large-8 large-centered">
          <div className="row">
            <div className="large-4 columns">
              <form>
                <fieldset>
                  <legend>Notes</legend>
                  <input type="submit" className="button" value="16" />
                  <input type="submit" className="button" value="8" />
                  <input type="submit" className="button" value="4" />
                  <input type="submit" className="button" value="2" />
                  <input type="submit" className="button" value="1" />
                </fieldset>
                <fieldset>
                  <legend>Rests</legend>
                  <input type="submit" className="button" value="16" />
                  <input type="submit" className="button" value="8" />
                  <input type="submit" className="button" value="4" />
                  <input type="submit" className="button" value="2" />
                  <input type="submit" className="button" value="1" />
                </fieldset>
                <fieldset>
                  <input type="submit" className="button" value="Undo" />
                </fieldset>
              </form>
            </div>
            <div className="large-4 columns">
              <form>
                <fieldset>
                  <legend>Bars</legend>
                  <input type="submit" className="button warning" value="Close Bar (Bar Open)" />
                </fieldset>
                <fieldset>
                  <legend>Ties</legend>
                  <input type="submit" className="button" value="Open Tie" />
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
