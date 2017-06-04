import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';

let trebleScore = 'do-mi-mi-mi-mi-fa-so-la-ti-do-fi-la-so-re-fa-fa-fa-fa-so-la-so-fa-mi-fa-re-do-re-ti-re-do';
trebleScore = trebleScore.split('-').map((note) => {
  return {type: 'note', solfege: note, octave: 0 /* 4 */};
});
let trebleDurations = [[8, 8, 8, 8], ['8', 16, 4], [8, 8, 8, 8], [4, 4],
                       [8, 8, 8, 8], [16, 16, 16, 16, 4], [8, 16, 16, 8, 16, 16],
                       [4, 4]];
let treble = trebleDurations.map((measure, i, arr) => {
  return {
    endBar: i === (arr.length - 1) ? 'end' : 'single',
    notes: measure.map((duration) => {
      const note = trebleScore.shift();
      if (_.isNumber(duration)) {
        note.duration = duration.toString();
      } else {
        note.duration = duration;
        note.dotted = true
      }
      return note;
    })
  };
});
let bassScore = 'do-do-ti-la-so-so-so-do-so-so-do';
bassScore = bassScore.split('-').map((note, i) => {
  return {type: 'note', solfege: note, octave: 0 /* 2 */};
});
let bassDurations = [[2], [4, 4], [2], [2], [2], [2], [4, 4], [4, 4]];
let bass = bassDurations.map((measure, i, arr) => {
  return {
    endBar: i === (arr.length - 1) ? 'end' : 'single',
    notes: measure.map((duration) => {
      const note = bassScore.shift();
      if (_.isNumber(duration)) {
        note.duration = duration.toString();
      } else {
        note.duration = duration;
        note.dotted = true
      }
      return note;
    })
  };
});
[[0, 0], [1, 0], [6, 0], [7, 1]].forEach(([x, y]) => {
  bass[x].notes[y].octave = 1;
});
treble[2].notes[2].octave = 1;
treble[6].notes[5].octave = -1;

const pSetData = {
  options: {
    rhythm: [
      ['16', true], ['8', true], ['4', true], ['2', true], ['1', true]
    ],
    solfege: [
      ['ti', true], ['la', true], ['so', true], ['fi', true], ['fa', true],
      ['mi', true], ['re', true], ['do', true]
    ],
    keys: ['E', 'F', 'G'],
    key: 'F'
  },
  staves: [
    {
      clef: 'treble',
      name: 'Lead',
      tonic: 'f4',
      scale: 'major',
      solution: treble,
      answer: [
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'end', notes: []},
      ]
    },
    {
      clef: 'bass',
      name: 'Bass',
      tonic: 'f2',
      scale: 'major',
      solution: bass,
      answer: [
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'end', notes: []},
      ]
    }

  ],
  meter: {top: 2, bottom: 4},
  measures: 10,
};

export default class PSetStudentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vexData: pSetData,
      rhythmic: true,
      stave: 0,
      currentMeasure: 0,
      currentNote: 0,
      meter: {
        top: 0, bottom: 0
      },
      key: null
    };

    this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
    this.handlePositionUpdate = this.handlePositionUpdate.bind(this);
    this.handleMeterUpdate = this.handleMeterUpdate.bind(this);
    this.updateCurrentMeasure = this.updateCurrentMeasure.bind(this);
    this.saveAndToggle = this.saveAndToggle.bind(this);
    this.saveAndRender = this.saveAndRender.bind(this);
  }

  handleScoreUpdate(answer) {
    const newVexData = _.cloneDeep(this.state.vexData);
    const stave = newVexData.staves[this.state.stave];
    Object.assign(stave, {answer});
    this.setState({
      vexData: newVexData
    });
  }

  saveAndToggle() {
    this.setState({
      rhythmic: !this.state.rhythmic
    });
  }

  changeStave(e) {
    e.preventDefault();
    const stave = parseInt(e.target.value);
    this.setState({
      stave,
      rhythmic: true,
      currentNote: 0,
      currentMeasure: 0,
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

  updateCurrentMeasure(measure) {
    this.setState({currentMeasure: measure});
  }

  saveAndRender() {
    alert('Mind our dust! Thanks for completing the exercise. Please leave any feedback in the survey!');
  }

  render() {
    const { vexData } = this.state;
    const stave = vexData.staves[this.state.stave];

    const staveOptions = vexData.staves.map((s, i) => {
      return (
        <option key={i} value={i}>{_.capitalize(s.clef)} ({s.name})</option>
      );
    });

    let renderMode = VexflowComponent.RenderMode.RHYTHMIC;

    let entryComponent = null;
    if (this.state.rhythmic) {
      entryComponent = (
        <RhythmicEntryComponent options={vexData.options}
          referenceMeter={vexData.meter}
          stave={vexData.staves[this.state.stave]}
          meter={this.state.meter}
          updateStave={this.handleScoreUpdate}
          updatePosition={this.handlePositionUpdate}
          updateMeter={this.handleMeterUpdate}
          currentMeasure={this.state.currentMeasure}
          save={this.saveAndToggle} />
      );
    } else {
      renderMode = VexflowComponent.RenderMode.MELODIC;
      entryComponent = (
        <MelodicEntryComponent options={vexData.options}
          keySignature={this.state.key}
          stave={vexData.staves[this.state.stave]}
          updateStave={this.handleScoreUpdate}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          save={this.saveAndToggle}
          complete={this.saveAndRender} />
      );
    }

    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;

    return (
      <div className="small-12">
        <div className="row">
          <div className="small-12 large-10 small-centered">
            <h3>Demo Dication: {this.state.rhythmic ? 'Rhythmic' : 'Melodic'} Entry</h3>
            <div className="row">
              <div className="small-10 columns">
                <VexflowComponent staves={vexData.staves}
                                  editing={this.state.stave}
                                  meter={vexData.meter}
                                  mode={renderMode}
                                  currentMeasure={this.state.currentMeasure}
                                  startMeasure={startMeasure}
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
