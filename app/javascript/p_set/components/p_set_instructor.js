import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';
import { newPSet } from '../lib/models';


function pSetUrl(id) {
  return `/admin/p_sets/${id}.json`;
}

export default class PSetInstructorComponent extends React.Component {
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
      keySignature: '',
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

  handleScoreUpdate(solution, changeMeasure, changeNote) {
    const newVexData = _.cloneDeep(this.state.vexData);
    const stave = newVexData.data.staves[this.state.stave];
    Object.assign(stave, {solution});

    this.postUpdate(newVexData);
  }

  get rhythmic() {
    return this.props.location.pathname.match(/\/rhythm\/?$/) !== null;
  }

  saveAndToggle() {
    this.setState({
      rhythmic: !this.state.rhythmic
    });
  }

  postUpdate(newState) {
    this.setState({vexData: newState});
    const { p_set_id } = this.props.match.params;
    window.localStorage.setItem(pSetUrl(p_set_id), JSON.stringify(newState));
  }

  changeStave(e) {
    e.preventDefault();
    const stave = parseInt(e.target.value);
    let {rhythmic} = this.state;
    const newStaveSolution = this.state.vexData.data.staves[stave].solution;
    rhythmic = _.every(newStaveSolution, (s) => _.isEmpty(s.notes));
    this.setState({
      stave,
      rhythmic,
      currentNote: 0,
      currentMeasure: 0
    });
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
    const url = pSetUrl(p_set_id);
    let pSet = window.localStorage.getItem(url);
    if (_.isUndefined(pSet)) {
      alert('No PSet found by this ID!');
    } else {
      pSet = JSON.parse(pSet);
      this.setState({vexData: pSet});
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
          meter={this.state.meter}
          updateStave={this.handleScoreUpdate}
          updatePosition={this.handlePositionUpdate}
          updateMeter={this.handleMeterUpdate}
          currentMeasure={this.state.currentMeasure}
          instructor={true}
          save={this.saveAndToggle} />
      );
    } else {
      renderMode = VexflowComponent.RenderMode.MELODIC;
      entryComponent = (
        <MelodicEntryComponent options={vexData.options}
          keySignature={this.state.keySignature}
          stave={vexData.staves[this.state.stave]}
          updateStave={this.handleScoreUpdate}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          updateKeySignature={this.handleKeySignatureUpdate}
          save={this.saveAndToggle}
          instructor={true}
          complete={this.saveAndRender} />
      );
    }

    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;
    const mode = this.rhythmic ? 'rhythm' : 'melody';
    return (
      <div className="small-12" ref={(el) => this.containerEl = el}>
        <div className="row">
          <div className="small-12 large-10 small-centered">
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
                            onChange={this.changeStave.bind(this)}>
                      {staveOptions}
                    </select>
                  </fieldset>
                </div>
                {entryComponent}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
