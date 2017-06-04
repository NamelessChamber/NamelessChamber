import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';

/**
 * TODO:
 * - grey out save button until all measures are completed
 * - highlight incorrect notes
 */

export default class RhythmicEntryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    stave: PropTypes.object.isRequired,
    updateStave: PropTypes.func.isRequired,
    updatePosition: PropTypes.func.isRequired,
    currentMeasure: PropTypes.number.isRequired,
    save: PropTypes.func.isRequired
  }

  setCurrentMeasure(increment, e) {
    e.preventDefault();
    let { currentMeasure } = this.props;

    if (increment) {
      const scoreLength = this.props.stave.answer.length - 1;
      currentMeasure = Math.min(scoreLength, currentMeasure + 1);
    } else {
      currentMeasure = Math.max(0, currentMeasure - 1);
    }

    this.props.updatePosition({
      currentMeasure
    });
  }

  appendNote(e, rest) {
    e.preventDefault();
    let duration = e.target.value;
    if (rest) {
      duration += 'r';
    }

    const newNote = {
      type: 'note',
      duration: duration,
      dots: 0
    };

    const newAnswer = _.cloneDeep(this.props.stave.answer);
    const measure = newAnswer[this.props.currentMeasure];
    measure.notes.push(newNote);

    this.props.updateStave(newAnswer);
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
    const { currentMeasure } = this.props;
    const measure = newAnswer[currentMeasure];
    measure.notes = _.dropRight(measure.notes);

    this.props.updateStave(newAnswer);
    this.setState({dotted: false});
  }

  getErrors() {
    const { staves, currentMeasure } = this.props;
    const stave = staves[this.props.stave];
    const measure = stave.answer[currentMeasure];
    const { notes } = measure;
    const solutionMeasure = stave.solution[currentMeasure];
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

  getCurrentNote(answer) {
    const measure = answer[this.props.currentMeasure].notes;
    if (measure.length) {
      return measure[measure.length - 1];
    }
  }

  changeDot(increment) {
    const newAnswer = _.cloneDeep(this.props.stave.answer);
    const note = this.getCurrentNote(newAnswer);

    if (!_.isUndefined(note)) {
      if (increment) {
        note.dots += 1;
      } else {
        note.dots = Math.max(note.dots - 1, 0);
      }
    }

    this.props.updateStave(newAnswer);
  }

  handleKeyDown(e) {
    switch (e.key) {
      case 'Enter':
        this.appendNote(e);
        break;
      case ' ':
        this.appendNote(e, true);
        break;
      case 'Backspace':
      case 'Delete':
        this.removeNote(e);
        break;
      case 'd':
        this.changeDot(true);
        break;
      case 'D':
        this.changeDot(false);
        break;
      case 'ArrowRight':
        this.setCurrentMeasure(true, e);
        break;
      case 'ArrowLeft':
        this.setCurrentMeasure(false, e);
        break;
    }
  }

  noteChange(e) {
    const { value } = e.target;

    this.setState({
      currentNote: value
    });
  }

  componentDidMount() {
    this.noteInput.focus();
  }

  render() {
    const durationString = (duration) => {
      if (duration === '1') {
        return duration;
      } else {
        return `1/${duration}`;
      }
    };
    const noteOptions = this.props.options.filter(x => x[1])
      .map(([duration, _], i) => {
        return (
          <option key={i} value={duration}>{durationString(duration)}</option>
        );
      });

    const startMeasure = Math.floor(this.props.currentMeasure / 4) * 4;

    return (
      <div className="row columns">
        <div className="reveal" id="help-text" data-reveal>
          <ul>
            <li><b>Right/left</b> arrows change current measure</li>
            <li><b>Up/down</b> arrows select note duration</li>
            <li><b>Enter</b> adds a note of selected duration</li>
            <li><b>Space</b> adds a rest of selected duration</li>
            <li><b>d</b> adds a dot to the last note in a measure</li>
            <li><b>Shift+d</b> removes a dot from the last note in a measure</li>
          </ul>
        </div>
        <div className="row columns">
          <fieldset>
            <legend>Notes</legend>
            <select multiple
                    ref={(input) => this.noteInput = input}
                    onBlur={(e) => e.target.focus()}
                    onKeyDown={this.handleKeyDown.bind(this)}
                    style={{width: '85px', height: '230px'}}
                    value={[this.state.currentNote]}
                    onChange={this.noteChange.bind(this)}>
              {noteOptions}
            </select>
          </fieldset>
        </div>
        <div className="row columns">
          <fieldset>
            <legend>Proceed to Melody</legend>
            <input type="submit"
              className="button"
              value="Save and Continue"
              onClick={this.props.save}/>
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
