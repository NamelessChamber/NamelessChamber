import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';
import HarmonicEntryComponent from './harmonic_entry';
import { newPSet, validateMeter, validateOptions } from '../lib/models';
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
      posting: false
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
    const stave = newVexData.data.staves[this.state.stave];
    Object.assign(stave, {solution});

    this.setState({vexData: newVexData});
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

  saveAndToggle() {
  }

  postUpdate() {
    const { p_set_id } = this.props.match.params;
    this.setState({posting: true});
    updatePSet(p_set_id, this.state.vexData).done((pSet) => {
      this.setState({vexData: pSet});
    }).fail((e) => {
      console.log(e.status);
    }).always(() => {
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
    this.setState(pos);
  }

  handleMeterUpdate(meter) {
    if (_.isEqual(meter, this.state.vexData.meter)) {
      alert('Correct!');
    } else {
      alert('Incorrect... please try again!');
    }
    this.setState({meter});
  }

  handleKeySignatureUpdate(keySignature) {
    if (keySignature === this.state.vexData.options.key) {
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

  componentDidMount() {
    const { p_set_id } = this.props.match.params;
    fetchPSet(p_set_id).done((pSet) => {
      const stave = this.harmonic ? pSet.data.staves.length - 1 : 0;
      this.setState({vexData: pSet, stave});
    }).fail((e) => {
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
          instructor={true}
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
          save={this.saveAndToggle}
          instructor={true}
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
          instructor={true} />
      );
    }

    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;
    const mode = this.rhythmic ? 'rhythm' : 'melody';
    return (
      <div className="small-12 columns" ref={(el) => this.containerEl = el}>
        <h3>{this.state.vexData.name}: {this.rhythmic ? 'Rhythmic' : 'Melodic'} Entry</h3>
        <div className="row">
          <div className="small-10 columns">
            <VexflowComponent staves={vexData.staves}
                              render="solution"
                              editing={this.state.stave}
                              meter={this.state.vexData.data.meter}
                              mode={renderMode}
                              keySignature={this.state.keySignature}
                              currentMeasure={this.state.currentMeasure}
                              startMeasure={startMeasure}
                              measures={this.state.vexData.data.measures}
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
