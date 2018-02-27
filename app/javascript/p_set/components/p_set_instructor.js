import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';
import HarmonicEntryComponent from './harmonic_entry';
import { newPSet, validateMeter, validateOptions, compareMeter } from '../lib/models';
import { fetchPSet, updatePSet } from '../lib/api';

export default class PSetInstructorComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stave: 0,
      currentMeasure: 0,
      currentNote: 0,
      meter: {
        top: 0, bottom: 0
      },
      keySignature: '',
      posting: false,
      errors: []
    };

    this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
    this.handlePositionUpdate = this.handlePositionUpdate.bind(this);
    this.handleMeterUpdate = this.handleMeterUpdate.bind(this);
    this.handleKeySignatureUpdate = this.handleKeySignatureUpdate.bind(this);
    this.updateCurrentMeasure = this.updateCurrentMeasure.bind(this);
    this.saveAndToggle = this.saveAndToggle.bind(this);
    this.saveAndRender = this.saveAndRender.bind(this);

    this.showError = false;
  }

  handleScoreUpdate(solution) {
    const newVexData = _.cloneDeep(this.state.vexData);
    const stave = newVexData.data.staves[this.stave];
    Object.assign(stave, {solution});

    const { meter } = newVexData.data;
    const { currentMeasure } = this.state;
    const measure = solution[currentMeasure];
    const errors = [];
    const result = compareMeter(meter, measure);
    // if (result > 0) {
    //   errors.push(`Measure ${currentMeasure + 1} in ${stave.name} has too few beats`);
    // } else
    if (result < 0) {
      errors.push(`Measure ${currentMeasure + 1} in ${stave.name} has too many beats`);
    }

    this.setState({vexData: newVexData, errors});
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

  get stave() {
    return this.harmonic ?
      this.state.vexData.data.staves.length - 1 :
      this.state.stave;
  }

  saveAndToggle() {
  }

  postUpdate() {
    const { p_set_id } = this.props.match.params;
    this.setState({posting: true});
    updatePSet(p_set_id, this.state.vexData, true).then((pSet) => {
      this.setState({
        vexData: pSet,
        posting: false
      });
    }).catch((e) => {
      console.log(e.status);
      this.setState({posting: false});
    });
  }

  changeStave(e) {
    e.preventDefault();
    let stave = this.harmonic ?
      this.state.vexData.data.staves.length - 1 :
      parseInt(e.target.value);
    const newStaveSolution = this.state.vexData.data.staves[stave].solution;
    const rhythmic = _.every(newStaveSolution, (s) => _.isEmpty(s.notes));

    this.setState({
      stave,
      currentNote: 0,
      currentMeasure: 0
    });
    if (rhythmic) {
      this.props.history.push('rhythm')
    }
  }

  handlePositionUpdate(pos) {
    if (this.rhythmic) {
      const { meter, staves } = this.state.vexData.data;
      const measure =
        staves[this.stave].solution[this.state.currentMeasure];
      const meterCheck = compareMeter(meter, measure);
      if (meterCheck > 0) {
        alert('Measure has too few beats! Please go back and correct it.');
      } else if (meterCheck < 0) {
        alert('Measure has too many beats! Please go back and correct it.');
      }
    }
    this.setState(pos);
  }

  handleMeterUpdate(meter) {
    this.setState({meter});
  }

  handleKeySignatureUpdate(keySignature) {
    this.setState({keySignature});
  }

  updateCurrentMeasure(measure) {
    this.setState({currentMeasure: measure});
  }

  saveAndRender() {
    alert('Mind our dust! Thanks for completing the exercise. Please leave any feedback in the survey!');
  }

  componentDidMount() {
    const { p_set_id } = this.props.match.params;
    fetchPSet(p_set_id, true).then((pSet) => {
      const stave = this.harmonic ? pSet.data.staves.length - 1 : 0;
      this.setState({vexData: pSet, stave});
    }).catch((e) => {
      console.log(e.status);
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

    let optionErrors = validateOptions(vexData);
    if (_.isArray(optionErrors)) {
      optionErrors = optionErrors.map((e) => (<li>{e}</li>));

      return (
        <div className="small-12 columns">
          <ul>{optionErrors}</ul>
          <Link to="options">Return to Options</Link>
        </div>
      );
    }

    const stave = vexData.staves[this.stave];

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
          stave={vexData.staves[this.stave]}
          measures={stave.solution}
          staveId={this.stave}
          meter={this.state.meter}
          updateStave={this.handleScoreUpdate}
          updatePosition={this.handlePositionUpdate}
          updateMeter={this.handleMeterUpdate}
          currentMeasure={this.state.currentMeasure}
          instructor={true}
          save={this.saveAndToggle} />
      );
    } else if (this.melodic) {
      renderMode = VexflowComponent.RenderMode.MELODIC;
      entryComponent = (
        <MelodicEntryComponent options={vexData.options}
          keySignature={this.state.keySignature}
          stave={vexData.staves[this.stave]}
          measures={stave.solution}
          staveId={this.stave}
          updateStave={this.handleScoreUpdate}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          updateKeySignature={this.handleKeySignatureUpdate}
          save={this.saveAndToggle}
          instructor={true}
          complete={this.saveAndRender} />
      );
    } else {
      renderMode = VexflowComponent.RenderMode.HARMONIC;
      entryComponent = (
        <HarmonicEntryComponent options={vexData.options}
          stave={vexData.staves[this.stave]}
          measures={stave.solution}
          staveId={this.stave}
          updateStave={this.handleScoreUpdate}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          save={this.saveAndToggle}
          instructor={true} />
      );
    }

    const errors = this.state.errors.map((e, i) => (
      <li key={i}>{e}</li>
    ));
    const showIf = (cond) => {
      return cond ?
        {} : {display: 'none'};
    };

    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;
    const mode = this.rhythmic ? 'rhythm' : 'melody';
    return (
      <div className="small-12 columns" ref={(el) => this.containerEl = el}>
        <h3>{this.state.vexData.name}: {this.rhythmic ? 'Rhythmic' : this.melodic ? 'Melodic' : 'Harmonic'} Entry</h3>
        <div className="row">
          <div className="small-10 columns">
            <VexflowComponent staves={vexData.staves}
                              render="solution"
                              editing={this.stave}
                              meter={this.state.vexData.data.meter}
                              mode={renderMode}
                              keySignature={this.state.keySignature}
                              currentMeasure={this.state.currentMeasure}
                              startMeasure={startMeasure}
                              measures={this.state.vexData.data.measures}
                              currentNote={this.state.currentNote} />
            <div style={showIf(!_.isEmpty(errors))}>
              <ul>{errors}</ul>
            </div>
          </div>
          <div className="small-2 columns">
            <div className="row columns">
              <fieldset>
                <legend>Stave</legend>
                <select value={this.stave}
                        disabled={this.harmonic}
                        onChange={this.changeStave.bind(this)}>
                  {staveOptions}
                </select>
              </fieldset>
              <div>
                <button
                  className="button"
                  onClick={this.postUpdate.bind(this)}>
                  {this.state.posting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
            {entryComponent}
          </div>
        </div>
      </div>
    );
  }
}
