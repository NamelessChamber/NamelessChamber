import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';
import HarmonicEntryComponent from './harmonic_entry';

function pSetUrl(id) {
  return `/admin/p_sets/${id}.json`;
}

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
      errors: []
    };

    this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
    this.handlePositionUpdate = this.handlePositionUpdate.bind(this);
    this.handleMeterUpdate = this.handleMeterUpdate.bind(this);
    this.handleKeySignatureUpdate = this.handleKeySignatureUpdate.bind(this);
    this.updateCurrentMeasure = this.updateCurrentMeasure.bind(this);
    this.saveAndToggle = this.saveAndToggle.bind(this);
    this.saveAndRender = this.saveAndRender.bind(this);
    this.reportErrors = this.reportErrors.bind(this);

    this.showError = false;
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

  postUpdate(newState) {
    this.setState({vexData: newState});
    const { p_set_id } = this.props.match.params;
    window.localStorage.setItem(pSetUrl(p_set_id), JSON.stringify(newState));
  }

  handleScoreUpdate(answer, changeMeasure, changeNote) {
    const newVexData = _.cloneDeep(this.state.vexData);
    const stave = newVexData.data.staves[this.state.stave];
    Object.assign(stave, {answer});

    if (this.errorModalEl) {
      try {
        $(this.errorModalEl).foundation('close');
      } catch (e) {
      }
    }

    const staveErrors = _.cloneDeep(this.state.staveErrors);
    if (_.isArray(staveErrors)) {
      staveErrors[changeMeasure][changeNote] = false;
    }

    this.setState({
      staveErrors
    });
    this.postUpdate(newVexData);
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

  handleMeterUpdate(meter) {
    if (_.isEqual(meter, this.state.vexData.data.meter)) {
      alert('Correct!');
    } else {
      alert('Incorrect... please try again!');
    }
    this.setState({meter});
  }

  handleKeySignatureUpdate(keySignature) {
    const stave = this.state.vexData.data.staves[0];
    const key = stave.tonic.pitch;
    if (keySignature === key) {
      alert('Correct!');
    } else {
      alert('Incorrect... please try again!');
    }
    this.setState({keySignature});
  }

  updateCurrentMeasure(measure) {
    this.setState({currentMeasure: measure});
  }

  saveAndRender() {
    alert('Mind our dust! Thanks for completing the exercise. Please leave any feedback in the survey!');
  }

  getErrors(rhythmic) {
    const stave = this.state.vexData.staves[this.state.stave];
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
            n1.dots !== n2.dots;
        } else {
          return !_.isEqual(n1, n2);
        }
      });
    });
  }

  reportErrors(errors) {
    if (!_.isUndefined(errors)) {
      // reporting an error modal
      this.showError = true;
      this.setState({errors});
    } else {
      // marking errors on stave
      errors = [];
      const staveErrors = this.getErrors(this.rhythmic);
      if (_.every(staveErrors, (es) => _.every(es, (e) => !e))) {
        this.showError = true;
        errors.push('No errors!');
      }
      this.setState({staveErrors, errors});
    }
  }

  componentDidMount() {
    const { p_set_id } = this.props.match.params;
    const url = pSetUrl(p_set_id);
    let pSet = window.localStorage.getItem(url);
    if (_.isUndefined(pSet)) {
      alert('No PSet found by this ID!');
    } else {
      pSet = JSON.parse(pSet);
      const stave = this.harmonic ? pSet.data.staves.length - 1 : 0;
      this.setState({vexData: pSet, stave});
    }

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

    const staveOptions = vexData.staves.map((s, i) => {
      return (
        <option key={i} value={i}>{s.name}</option>
      );
    });

    let renderMode = VexflowComponent.RenderMode.RHYTHMIC;

    let entryComponent = null;
    if (this.rhythmic) {
      entryComponent = (
        <RhythmicEntryComponent options={vexData.options}
          referenceMeter={vexData.meter}
          stave={vexData.staves[this.state.stave]}
          staveId={this.state.stave}
          meter={this.state.meter}
          updateStave={this.handleScoreUpdate}
          updatePosition={this.handlePositionUpdate}
          updateMeter={this.handleMeterUpdate}
          currentMeasure={this.state.currentMeasure}
          reportErrors={this.reportErrors}
          instructor={false}
          save={this.saveAndToggle} />
      );
    } else if (this.melodic) {
      renderMode = VexflowComponent.RenderMode.MELODIC;
      entryComponent = (
        <MelodicEntryComponent options={vexData.options}
          keySignature={this.state.keySignature}
          stave={vexData.staves[this.state.stave]}
          staveId={this.state.stave}
          updateStave={this.handleScoreUpdate}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          updateKeySignature={this.handleKeySignatureUpdate}
          reportErrors={this.reportErrors}
          save={this.saveAndToggle}
          instructor={false}
          complete={this.saveAndRender} />
      );
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

    return (
      <div className="small-12" ref={(el) => this.containerEl = el}>
        <div className="reveal"
          data-reveal
          id="error-modal"
          ref={(el) => this.errorModalEl = el}>
          <h4>Errors</h4>
          <ul>{errors}</ul>
        </div>
        <h3>Demo Dication: {this.rhythmic ? 'Rhythmic' : 'Melodic'} Entry</h3>
        <div className="row">
          <div className="small-10 columns">
            <VexflowComponent staves={vexData.staves}
              editing={this.state.stave}
              meter={this.state.meter}
              render="answer"
              mode={renderMode}
              keySignature={this.state.keySignature}
              currentMeasure={this.state.currentMeasure}
              startMeasure={startMeasure}
              measures={this.state.vexData.data.measures}
              staveErrors={this.state.staveErrors}
              currentNote={this.state.currentNote} />
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
            </div>
            {entryComponent}
          </div>
        </div>
      </div>
      );
  }
}
