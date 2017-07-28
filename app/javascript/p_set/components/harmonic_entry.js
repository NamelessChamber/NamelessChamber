import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';

export default class HarmonicEntryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.focused = {
      harmony: true,
      inversion: false
    };
    this.inputs = {};
  }

  static propTypes = {
    options: PropTypes.object.isRequired,
    stave: PropTypes.object.isRequired,
    updateStave: PropTypes.func.isRequired,
    updatePosition: PropTypes.func.isRequired,
    currentMeasure: PropTypes.number.isRequired,
    currentNote: PropTypes.number.isRequired,
    reportErrors: PropTypes.func,
    save: PropTypes.func.isRequired,
    instructor: PropTypes.bool
  }

  static defaultProps = {
    instructor: true
  }

  getMeasures(stave) {
    const key = this.props.instructor ?
                'solution' : 'answer';
    return stave[key];
  }

  get measures() {
    return this.getMeasures(this.props.stave);
  }

  getMeasure(measures) {
    return measures[this.props.currentMeasure];
  }

  get measure() {
    return this.getMeasure(this.measures);
  }

  getNote(measure) {
    if (!_.isUndefined(measure)) {
      return measure.notes[this.props.currentNote];
    }
  }

  get note() {
    return this.getNote(this.measure);
  }

  setCurrentNote(increment, e) {
    e.preventDefault();
    let { currentNote, currentMeasure } = this.props;
    const staveLength = this.measures.length;
    const measure = this.measure;
    const { notes } = measure;

    if (increment) {
      const measureLength = notes.length - 1;
      if (currentNote + 1 > measureLength) {
        if (currentMeasure + 1 < staveLength &&
            this.measures[currentMeasure + 1].notes.length > 0) {
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
          const measureLength = this.measures[currentMeasure].notes.length;
          currentNote = measureLength - 1;
        }
      }
    }

    this.props.updatePosition({
      currentNote,
      currentMeasure
    });
  }

  updateKey(key, e) {
    const { value } = e.target;
    const stave = _.cloneDeep(this.props.stave)
    const measures = this.getMeasures(stave);
    const measure = this.getMeasure(measures);
    const note = this.getNote(measure);

    if (_.isUndefined(note)) {
      return;
    }

    if (value === '') {
      delete note[key];
    } else {
      note[key] = value;
    }

    this.props.updateStave(measures);
  }

  handleKeyDown(e) {
    e.preventDefault();
    switch (e.key) {
      case 'ArrowRight':
        this.setCurrentNote(true, e);
        break;
      case 'ArrowLeft':
        this.setCurrentNote(false, e);
        break;
    }
  }

  handleFocus(key, e) {
    const other = key === 'harmony' ? 'inversion' : 'harmony';
    this.focused[key] = true;
    this.focused[other] = false;
  }

  handleBlur(key, e) {
    const other = key === 'harmony' ? 'inversion' : 'harmony';
    setTimeout(() => {
      if (!this.focused[other]) {
        this.focused[key] = true;
        this.focusElement();
      } else {
        this.focused[key] = false;
      }
    }, 0);
  }

  focusElement() {
    const [key] = _.chain(this.focused)
      .toPairs()
      .filter(([, x]) => x)
      .map(_.first)
      .value();
    const el = this.inputs[key];

    el.focus();
  }

  componentDidMount() {
    this.focusElement();
    $(this.containerEl).foundation();
  }

  componentDidUpdate() {
    this.focusElement();
    $(this.containerEl).foundation();
  }

  render() {
    const harmonyOptions = this.props.options.harmony.filter(([, x]) => x)
      .map(([harmony,], i) => (
        <option key={i + 1} value={harmony}>{harmony}</option>
      ));
    harmonyOptions.unshift((
      <option key={0} value="">-</option>
    ));
    const inversionOptions = this.props.options.inversion.filter(([, x]) => x)
      .map(([inversion,], i) => (
        <option key={i + 1} value={inversion}>{inversion}</option>
      ));
    inversionOptions.unshift((
      <option key={0} value="">-</option>
    ));

    const currentHarmony = this.note.harmony || '';
    const currentInversion = this.note.inversion || '';

    return (
      <div className="row columns" ref={(el) => this.containerEl = el}>
        <div className="reveal" id="help-text-harmonic" data-reveal>
          <ul>
            <li><b>Right/left</b> arrows change current measure</li>
            <li><b>Enter</b> adds the selected harmony to the selected note</li>
            <li><b>Backspace/Delete</b> removes the harmony from the selected note</li>
          </ul>
        </div>
        <fieldset>
          <legend>Harmony</legend>
          <select multiple
            ref={(input) => this.inputs['harmony'] = input}
            onKeyDown={this.handleKeyDown.bind(this)}
            onBlur={this.handleBlur.bind(this, 'harmony')}
            style={{width: '85px', height: '230px'}}
            value={[currentHarmony]}
            onFocus={this.handleFocus.bind(this, 'harmony')}
            onChange={this.updateKey.bind(this, 'harmony')}>
            {harmonyOptions}
          </select>
        </fieldset>
        <fieldset>
          <legend>Inversion</legend>
          <select multiple
            ref={(input) => this.inputs['inversion'] = input}
            onKeyDown={this.handleKeyDown.bind(this)}
            onBlur={this.handleBlur.bind(this, 'inversion')}
            style={{width: '85px', height: '230px'}}
            value={[currentInversion]}
            onFocus={this.handleFocus.bind(this, 'inversion')}
            onChange={this.updateKey.bind(this, 'inversion')}>
            {inversionOptions}
          </select>
        </fieldset>
        <div>
          <Link to="melody" className="button">
            Back to Melody
          </Link>
        </div>
        <div>
          <button data-open="help-text-harmonic" className="button">
            Show Help
          </button>
        </div>
      </div>
    );
  }
}
