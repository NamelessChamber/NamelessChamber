//"Nameless Chamber" - a music dictation web application.
//"Copyright 2020 Massachusetts Institute of Technology"

//This file is part of "Nameless Chamber"
    
//"Nameless Chamber" is free software: you can redistribute it and/or modify
//it under the terms of the GNU Affero General Public License as published by //the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//"Nameless Chamber" is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU Affero General Public License for more details.

//You should have received a copy of the GNU Affero General Public License
//along with "Nameless Chamber".  If not, see	<https://www.gnu.org/licenses/>.

//Contact Information: garo@mit.edu 
//Source Code: https://github.com/NamelessChamber/NamelessChamber





import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import ReactAudioPlayer from 'react-audio-player';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';
import HarmonicEntryComponent from './harmonic_entry';
import { newPSet, validateMeter, validateOptions, currentPage, compareMeterAt, nextNonEmptyMeasure, prevNonEmptyMeasure, nextStave } from '../lib/utils';
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

    this.changeStave = this.changeStave.bind(this);
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

    const { meter, pickUpBeat } = newVexData.data;
    const { currentMeasure } = this.state;
    const errors = [];
    const result = compareMeterAt(meter, solution, pickUpBeat, currentMeasure);
    // if (result > 0) {
    //   errors.push(`Measure ${currentMeasure + 1} in ${stave.name} has too few beats`);
    // } else
    if (result < 0) {
      errors.push(`Measure ${currentMeasure + 1} in ${stave.name} has too many beats`);
    }

    this.setState({vexData: newVexData, errors});
  }

  isRhythmic(props = this.props) {
    return props.location.pathname.match(/\/rhythm\/?$/) !== null;
  }

  get rhythmic() {
    return this.isRhythmic();
  }

  get melodic() {
    return this.props.location.pathname.match(/\/melody\/?$/) !== null;
  }

  isHarmonic(props = this.props) {
    return props.location.pathname.match(/\/harmony\/?$/) !== null;
  }

  get harmonic() {
    return this.isHarmonic();
  }

  getStave(props = this.props) {
    return this.isHarmonic(props) ?
      this.state.vexData.data.staves.length - 1 :
      this.state.stave;
  }

  get stave() {
    return this.getStave();
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

  changeStave(e, keyDown) {
    e.preventDefault();
    
    let stave = this.harmonic ? 
      this.state.vexData.data.staves.length - 1 :
      keyDown? nextStave(e.key):
      parseInt(e.target.value);
    const newStaveSolution = this.state.vexData.data.staves[stave].solution;
    const rhythmic = _.every(newStaveSolution, (s) => _.isEmpty(s.notes));
    let currentMeasure = 0;
    if (!this.rhythmic) {
      currentMeasure =
        nextNonEmptyMeasure(newStaveSolution, this.state.currentMeasure);
    }

    this.setState({
      stave,
      currentMeasure,
      currentNote: 0
    });
  }

  handlePositionUpdate(pos, increment) {
    if (this.rhythmic) {
      const { meter, staves, pickUpBeat } = this.state.vexData.data;
      const { currentMeasure } = this.state;
      const solution = staves[this.stave].solution;
      const meterCheck = compareMeterAt(meter, solution, pickUpBeat, currentMeasure);
      // if (meterCheck > 0) {
      //   alert('Measure has too few beats! Please go back and correct it.');
      // } else
      if (meterCheck < 0) {
        alert('Measure has too many beats! Please go back and correct it.');
        return;
      } else if (meterCheck > 0 && increment) {
        alert('Measure has too few beats! Please go back and correct it.');
        return;
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
      let currentMeasure = 0;
      if (!this.rhythmic) {
        currentMeasure = nextNonEmptyMeasure(pSet.data.staves[stave].solution);
      }
      this.setState({vexData: pSet, stave, currentMeasure});
    }).catch((e) => {
      console.log(e.status);
    });

    if (!_.isUndefined(this.containerEl)) {
      $(this.containerEl).foundation();
    }
  }

  componentWillReceiveProps(props) {
    if (!this.isRhythmic(props)) {
      const { staves } = this.state.vexData.data;
      let { currentMeasure } = this.state;
      const solution = staves[this.getStave(props)].solution;
      currentMeasure = nextNonEmptyMeasure(solution, currentMeasure);
      this.setState({currentMeasure});
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
        <RhythmicEntryComponent 
          errors={[]}
          options={vexData.options}
          referenceMeter={vexData.meter}
          stave={vexData.staves[this.stave]}
          measures={stave.solution}
          staveId={this.stave}
          meter={this.state.meter}
          updateStave={this.handleScoreUpdate}
          changeStave={this.changeStave}
          updatePosition={this.handlePositionUpdate}
          updateMeter={this.handleMeterUpdate}
          currentMeasure={this.state.currentMeasure}
          instructor={true}
          save={this.saveAndToggle} />
      );
    } else if (this.melodic) {
      renderMode = VexflowComponent.RenderMode.MELODIC;
      entryComponent = (
        <MelodicEntryComponent 
          errors={[]}
          options={vexData.options}
          keySignature={this.state.keySignature}
          stave={vexData.staves[this.stave]}
          measures={stave.solution}
          staveId={this.stave}
          updateStave={this.handleScoreUpdate}
          changeStave={this.changeStave}
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
        <HarmonicEntryComponent 
          errors={[]}
          options={vexData.options}
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

    let audios = _.flatMap(this.state.vexData.p_set_audios, ({name, audio}, i) => {
      return [
        (<dt key={i*2}>{name}</dt>),
        (<dd key={i*2+1}><ReactAudioPlayer src={audio} controls /></dd>)
      ];
    });

    const mode = this.rhythmic ? 'rhythm' : 'melody';
    return (
      <div className="small-12 columns" ref={(el) => this.containerEl = el}>
        <div className="row">
          <div className="small-10 columns"><h3>{this.state.vexData.name}: {this.rhythmic ? 'Rhythmic' : this.melodic ? 'Melodic' : 'Harmonic'} Entry</h3></div>
          <div className="small-2 columns">
            <fieldset>
              <legend>Audio Samples</legend>
              <dl>{audios}</dl>
            </fieldset>
          </div>
        </div>
        <div className="row">
          <div className="small-10 columns">
            <VexflowComponent staves={vexData.staves}
                              render="solution"
                              editing={this.stave}
                              meter={this.state.vexData.data.meter}
                              mode={renderMode}
                              keySignature={this.state.keySignature}
                              currentMeasure={this.state.currentMeasure}
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
