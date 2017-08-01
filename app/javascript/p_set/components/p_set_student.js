import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactAudioPlayer from 'react-audio-player';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';
import HarmonicEntryComponent from './harmonic_entry';

import { newAnswer, compareMeter } from '../lib/models';
import { fetchPSet, fetchPSetAnswer, updatePSetAnswer } from '../lib/api';

export default class PSetStudentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rhythmic: true,
      stave: 0,
      currentMeasure: 0,
      currentNote: 0,
      meter: {
        top: 0, bottom: 0
      },
      errors: [],
      posting: false,
      completing: false,
      submitting: false
    };

    this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
    this.handlePositionUpdate = this.handlePositionUpdate.bind(this);
    this.handleMeterUpdate = this.handleMeterUpdate.bind(this);
    this.handleKeySignatureUpdate = this.handleKeySignatureUpdate.bind(this);
    this.updateCurrentMeasure = this.updateCurrentMeasure.bind(this);
    this.saveAndToggle = this.saveAndToggle.bind(this);
    this.saveAndRender = this.saveAndRender.bind(this);
    this.reportErrors = this.reportErrors.bind(this);
  }

  get rhythmic() {
    return this.props.location.pathname.match(/\/rhythm\/?$/) !== null;
  }

  get melodic() {
    return this.props.location.pathname.match(/\/melody\/?$/) !== null;
  }

  get harmonic() {
    return this.props.location.pathname.match(/\/harmony\/?$/) !== null;
  }

  handleScoreUpdate(answer, changeMeasure, changeNote) {
    const newAnswer = _.cloneDeep(this.state.answer);
    const stave = newAnswer.staves[this.state.stave] = answer;

    if (this.errorModalEl) {
      try {
        $(this.errorModalEl).foundation('close');
      } catch (e) {
      }
    }

    const staveErrors = _.cloneDeep(this.state.staveErrors);
    if (_.isArray(staveErrors)) {
      staveErrors[this.state.stave][changeMeasure][changeNote] = false;
    }

    this.setState({answer: newAnswer, staveErrors});
  }

  saveAndToggle() {
    this.setState({
      rhythmic: !this.state.rhythmic
    });
  }

  changeStave(e) {
    e.preventDefault();
    const stave = this.harmonic ?
      this.state.vexData.data.staves.length - 1 :
      parseInt(e.target.value);
    const newStaveAnswer = this.state.vexData.data.staves[stave].answer;
    const rhythmic = _.every(newStaveAnswer, (a) => _.isEmpty(a.notes));
    this.setState({
      stave,
      currentNote: 0,
      currentMeasure: 0,
      staveErrors: undefined
    });

    if (rhythmic) {
      this.props.history.push('rhythm');
    }
  }

  handlePositionUpdate(pos) {
    this.setState(pos);
  }

  postAnswer(answer, submission, completed) {
    if (completed) {
      if (!confirm('Submission is final. Are you sure you want to proceed?')) {
        return;
      }
    }
    let postingKey = 'posting';
    if (completed) {
      postingKey = 'completing';
    } else if (submission) {
      postingKey = 'submitting';
    }
    this.setState({[postingKey]: true});
    const { p_set_id } = this.props.match.params;
    updatePSetAnswer(p_set_id, answer, submission, completed).then((answer) => {
      this.setState({answer, [postingKey]: false});
      if (submission) {
        this.reportErrors();
      }
      if (completed) {
        window.location = '/classrooms';
      }
    }).catch((e) => {
      console.log('error', e);
      this.setState({[postingKey]: false});
    });
  }

  handleMeterUpdate(meter) {
    const answer = _.cloneDeep(this.state.answer);
    answer.meter = meter;
    if (_.isEqual(meter, this.state.vexData.data.meter)) {
      alert('Correct!');
      this.postAnswer(answer, false);
    } else {
      alert('Incorrect... please try again!');
      this.setState({answer});
    }
  }

  handleKeySignatureUpdate(keySignature) {
    const stave = this.state.vexData.data.staves[0];
    const key = stave.tonic.pitch;
    const answer = _.cloneDeep(this.state.answer);
    answer.keySignature = keySignature;
    if (keySignature === key) {
      alert('Correct!');
      this.postAnswer(answer, false);
    } else {
      alert('Incorrect... please try again!');
      this.setState({answer});
    }
  }

  updateCurrentMeasure(measure) {
    this.setState({currentMeasure: measure});
  }

  saveAndRender() {
    alert('Mind our dust! Thanks for completing the exercise. Please leave any feedback in the survey!');
  }

  getErrors(rhythmic) {
    const staves = _.zipWith(
      this.state.vexData.data.staves,
      this.state.answer.staves,
      (s, a) => {
        return Object.assign(s, {answer: a});
      });

    return staves.map((stave) => {
      const { answer, solution } = stave;

      return _.zipWith(answer, solution, (m1, m2) => {
        return _.zipWith(m1.notes, m2.notes, (n1, n2) => {
          if (_.isUndefined(n1)) {
            return false;
          }

          if (_.isUndefined(n2)) {
            return true;
          }

          if (rhythmic) {
            return n1.duration !== n2.duration ||
            n1.tied !== n2.tied ||
            n1.dots !== n2.dots;
          } else {
            return !_.isEqual(n1, n2);
          }
        });
      });
    });
  }

  reportErrors() {
    // marking errors on stave
    let errors = [];
    const staveErrors = this.getErrors(this.rhythmic);
    if (_.every(staveErrors, (es) => _.every(es, (e) => !e))) {
      errors.push('No errors!');
    } else {
      const { meter, staves } = this.state.vexData.data;
      const solutionMeters = this.state.answer.staves.map((stave) => {
        return stave.map(compareMeter.bind(this, meter));
      });
      solutionMeters.forEach((stave, i) => {
        const staveName = staves[i].name;
        stave.forEach((measure, e) => {
          if (measure > 0) {
            errors.push(`Measure ${e + 1} in ${staveName} has too few beats`);
          } else if (measure < 0) {
            errors.push(`Measure ${e + 1} in ${staveName} has too many beats`);
          }
        });
      });
    }

    this.setState({staveErrors, errors});
  }

  componentDidMount() {
    const { p_set_id } = this.props.match.params;
    const pSetPromise = fetchPSet(p_set_id).then((pSet) => {
      const stave = this.harmonic ? pSet.data.staves.length - 1 : 0;
      return {vexData: pSet, stave};
    });
    const answerPromise = fetchPSetAnswer(p_set_id);
    Promise.all([pSetPromise, answerPromise]).then(([state, answer]) => {
      if (_.isEmpty(answer)) {
        answer = newAnswer(state.vexData);
      }
      this.setState(Object.assign(state, {answer}, {meter: answer.meter}));
    });

    if (!_.isUndefined(this.containerEl)) {
      $(this.containerEl).foundation();
    }
  }

  componentDidUpdate() {
    if (!_.isUndefined(this.errorModalEl) && this.showError) {
      const $error = $(this.errorModalEl);
      $error.foundation();
      this.showError = false;
      $error.foundation('open');
    }

    if (!_.isUndefined(this.containerEl)) {
      $(this.containerEl).foundation();
    }
  }

  render() {
    if (_.isUndefined(this.state.vexData)) {
      return (<div></div>);
    }

    const vexData = this.state.vexData.data;
    const stave = vexData.staves[this.state.stave];
    const answer = this.state.answer.staves[this.state.stave];

    const staveOptions = vexData.staves.map((s, i) => {
      return (
        <option key={i} value={i}>{s.name}</option>
      );
    });

    let renderMode = VexflowComponent.RenderMode.RHYTHMIC;

    let entryComponent = null;
    let audios = [];
    if (this.rhythmic) {
      entryComponent = (
        <RhythmicEntryComponent options={vexData.options}
          referenceMeter={vexData.meter}
          stave={stave}
          measures={answer}
          staveId={this.state.stave}
          meter={this.state.answer.meter}
          updateStave={this.handleScoreUpdate}
          updatePosition={this.handlePositionUpdate}
          updateMeter={this.handleMeterUpdate}
          currentMeasure={this.state.currentMeasure}
          reportErrors={this.reportErrors}
          instructor={false}
          save={this.saveAndToggle} />
      );
      audios = stave.audios.rhythm.map(({name, url}, i) => {
        return (
          <li key={i}>
            <p>{name}</p>
            <ReactAudioPlayer src={url}
              controls />
          </li>
        );
      });
    } else if (this.melodic) {
      renderMode = VexflowComponent.RenderMode.MELODIC;
      entryComponent = (
        <MelodicEntryComponent options={vexData.options}
          keySignature={this.state.answer.keySignature}
          stave={stave}
          measures={answer}
          staveId={this.state.stave}
          updateStave={this.handleScoreUpdate}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          updateKeySignature={this.handleKeySignatureUpdate}
          reportErrors={this.reportErrors}
          save={this.saveAndToggle}
          instructor={false} />
      );
      audios = stave.audios.melody.map(({name, url}, i) => {
        return (
          <li key={i}>
            <p>{name}</p>
            <ReactAudioPlayer src={url}
              controls />
          </li>
        );
      });
    } else {
      renderMode = VexflowComponent.RenderMode.MELODIC;
      entryComponent = (
        <HarmonicEntryComponent options={vexData.options}
          stave={vexData.staves[this.state.stave]}
          staveId={this.state.stave}
          updateStave={this.handleScoreUpdate}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          save={this.saveAndToggle}
          instructor={false} />
      );
    }

    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;
    const mode = this.rhythmic ? 'rhythm' : 'melody';
    const errors = this.state.errors.map((e, i) => {
      return (
        <li key={i}>{e}</li>
      );
    });

    const vfStaves = _.zipWith(
      vexData.staves,
      this.state.answer.staves,
      (s, a) => {
        return Object.assign(s, {answer: a});
      });

    const showIf = (cond) => {
      return cond ?
        {} : {display: 'none'};
    };

    return (
      <div className="small-12 columns" ref={(el) => this.containerEl = el}>
        <div className="reveal"
          data-reveal
          id="error-modal"
          ref={(el) => this.errorModalEl = el}>
          <h4>Errors</h4>
          <ul>{errors}</ul>
        </div>
        <h3>{this.state.vexData.name}: {this.rhythmic ? 'Rhythmic' : 'Melodic'} Entry</h3>
        <div className="row">
          <div className="small-10 columns">
            <VexflowComponent staves={vfStaves}
              editing={this.state.stave}
              meter={this.state.answer.meter}
              render="answer"
              mode={renderMode}
              keySignature={this.state.answer.keySignature}
              currentMeasure={this.state.currentMeasure}
              startMeasure={startMeasure}
              measures={this.state.vexData.data.measures}
              staveErrors={this.state.staveErrors}
              currentNote={this.state.currentNote} />
            <div style={showIf(!_.isEmpty(this.state.errors))}>
              <ul>{errors}</ul>
            </div>
          </div>
          <div className="small-2 columns">
            <div className="row columns">
              <fieldset>
                <legend>Stave</legend>
                <select value={this.state.stave}
                  disabled={this.harmonic}
                  onChange={this.changeStave.bind(this)}>
                  {staveOptions}
                </select>
              </fieldset>
              <p>
                <button
                  className="button"
                  onClick={() => this.postAnswer(this.state.answer, false, false)}>
                  {this.state.posting ? 'Saving...' : 'Save'}
                </button>
              </p>
              <p>
                <button
                  className="button"
                  onClick={() => this.postAnswer(this.state.answer, true, false)}>
                  {this.state.submitting ? 'Submitting...' : 'Check Answer'}
                </button>
              </p>
              <p>
                <button
                  className="button"
                  onClick={() => this.postAnswer(this.state.answer, true, true)}>
                  {this.state.completing ? 'Submitting...' : 'Complete PSet'}
                </button>
              </p>
            </div>

            {entryComponent}

            <fieldset>
              <legend>Audio Samples</legend>
              <ul>{audios}</ul>
            </fieldset>
          </div>
        </div>
      </div>
      );
  }
}
