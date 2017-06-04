import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';

require('../styles/rhythmic_entry.css');

const staveComplete = (stave) => {
  const stavesFull =  _.zipWith(stave.answer, stave.solution, (a, s) => {
    return a.notes.length === s.notes.length;
  });
 
  return _.every(stavesFull);
};

export default class RhythmicEntryComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      meter: props.meter
    };
  }

  static propTypes = {
    options: PropTypes.object.isRequired,
    stave: PropTypes.object.isRequired,
    referenceMeter: PropTypes.object.isRequired,
    meter: PropTypes.object,
    updateStave: PropTypes.func.isRequired,
    updatePosition: PropTypes.func.isRequired,
    updateMeter: PropTypes.func.isRequired,
    currentMeasure: PropTypes.number.isRequired,
    reportErrors: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired
  }

  setCurrentMeasure(increment, e) {
    e.preventDefault();
    let { currentMeasure } = this.props;

    const answerMeasure = this.props.stave.answer[currentMeasure];
    const solutionMeasure = this.props.stave.solution[currentMeasure];
    if (answerMeasure.notes.length > solutionMeasure.notes.length) {
      this.props.reportErrors([
        'Measure has too many notes'
      ]);
      return;
    } else if (answerMeasure.notes.length < solutionMeasure.notes.length) {
      this.props.reportErrors([
        'Measure has too few notes'
      ]);
      return;
    }

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

    const { currentMeasure } = this.props;
    const newAnswer = _.cloneDeep(this.props.stave.answer);
    const measure = newAnswer[currentMeasure];
    measure.notes.push(newNote);

    this.props.updateStave(newAnswer, currentMeasure, measure.length - 1);
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

    this.props.updateStave(newAnswer, currentMeasure, measure.notes.length);
    this.setState({dotted: false});
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

    const { currentMeasure } = this.props;
    const currentNote = this.props.stave.answer[currentMeasure].notes.length - 1;

    this.props.updateStave(newAnswer, currentMeasure, currentNote);
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

  updateMeter(pos, e) {
    let value = e.target.value;
    if (_.isString(value)) {
      value = parseInt(value);
    }

    const meter = Object.assign({}, this.state.meter, {[pos]: value});

    this.setState({
      meter
    });
  }

  componentDidMount() {
    this.noteInput.focus();
    $(this.containerEl).foundation();
  }

  componentDidUpdate() {
    this.noteInput.focus();
    $(this.containerEl).foundation();
  }

  checkWork() {
    if (staveComplete(this.props.stave)) {
      this.props.reportErrors();
    } else {
      this.props.reportErrors(['Must complete rhythmic entry before checking work']);
    }
  }

  render() {
    const durationString = (duration) => {
      if (duration === '1') {
        return duration;
      } else {
        return `1/${duration}`;
      }
    };
    const noteOptions = this.props.options.rhythm.filter(x => x[1])
      .map(([duration, _], i) => {
        return (
          <option key={i} value={duration}>{durationString(duration)}</option>
        );
      });

    const meterCorrect = _.isEqual(this.props.meter, this.props.referenceMeter);
    const showIf = (cond) => {
      return cond ?
        {} : {display: 'none'};
    };

    return (
      <div className="row columns" ref={(el) => this.containerEl = el}>
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
        <div className="row columns" style={showIf(!meterCorrect)}>
          <fieldset>
            <legend>Meter</legend>
            <input type="number"
                   className="meter-entry"
                   onChange={this.updateMeter.bind(this, 'top')}
                   value={this.state.meter.top} />
            /
            <input type="number"
                   className="meter-entry"
                   onChange={this.updateMeter.bind(this, 'bottom')}
                   value={this.state.meter.bottom} />
            <button className="button"
                    onClick={(e) => this.props.updateMeter(this.state.meter)}>
              Verify
            </button>
          </fieldset>
        </div>
        <div className="row columns" style={showIf(meterCorrect)}>
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
        <div className="row columns" style={showIf(meterCorrect)}>
          <fieldset>
            <legend>Check Work</legend>
            <input type="submit"
              className="button"
              value="Check"
              onClick={() => this.checkWork()}/>
          </fieldset>
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
