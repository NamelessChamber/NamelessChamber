import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';

let trebleScore = 'do-mi-mi-mi-mi-fa-so-le-ti-do-fi-la-so-re-fa-fa-fa-fa-so-la-so-fa-mi-fa-re-do-re-ti-re-do';
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
      ['16', true], ['8', true], ['4', true], ['2', true], ['1', true],
      ['16r', true], ['8r', true], ['4r', true], ['2r', true], ['1r', true]
    ],
    solfege: [
      ['ti', true], ['la', true], ['so', true], ['fi', true], ['fa', true],
      ['me', true], ['re', true], ['do', true]
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
      stave: 0
    };

    this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
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

  changeClef(e) {
    const clef = e.target.value;

    this.setState({clef});
  }

  saveAndRender() {
    alert('Mind our dust! Thanks for completing the exercise. Please leave any feedback in the survey!');
  }

  render() {
    let entryComponent = null;

    const { vexData } = this.state;
    const stave = vexData.staves[this.state.stave];

    const staveOptions = vexData.staves.map((stave, i) => {
      return (
        <option key={i} value={i}>{_.capitalize(stave.clef)} ({stave.name})</option>
      );
    });

    if (this.state.rhythmic) {
      entryComponent = (
        <RhythmicEntryComponent options={vexData.options.rhythm}
                                stave={stave}
                                meter={vexData.meter}
                                updateScore={this.handleScoreUpdate}
                                save={this.saveAndToggle} />
      );
    } else {
      entryComponent = (
        <MelodicEntryComponent options={vexData.options.solfege}
                               meter={vexData.meter}
                               stave={stave}
                               updateScore={this.handleScoreUpdate}
                               save={this.saveAndToggle}
                               complete={this.saveAndRender} />
      );
    }

    return (
      <div className="small-12">
        <div className="row">
          <div className="small-12 large-8 small-centered">
            <h3>Demo Dication: {this.state.rhythmic ? 'Rhythmic' : 'Melodic'} Entry</h3>
          </div>
        </div>
        <div className="row">
          <div className="small-12 large-8 small-centered">
            <fieldset>
              <legend>Stave</legend>
              <select onChange={this.changeClef.bind(this)}
                      value={this.state.clef}>
                {staveOptions}
              </select>
            </fieldset>
          </div>
        </div>
        {entryComponent}
      </div>
    );
  }
}
