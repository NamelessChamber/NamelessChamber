import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';

const vexData = {
  score: {
    key: 'F',
    treble: [
      {
        endBar: 'single',
        notes: [
          {type: 'note', duration: '8', solfege: 'd'},
          {type: 'note', duration: '8'},
          {type: 'note', duration: '8'},
          {type: 'note', duration: '8'},
        ]
      },
      {
        endBar: 'single',
        notes: [
          {type: 'note', keys: ['a/4'], duration: '8', dotted: true},
          {type: 'note', keys: ['b/4'], duration: '16'},
          {type: 'note', keys: ['c/5'], duration: '4'},
        ]
      },
      {
        endBar: 'single',
        notes: [
          {type: 'note', keys: ['d/5'], duration: '8'},
          {type: 'note', keys: ['e/5'], duration: '8'},
          {type: 'note', keys: ['f/5'], duration: '8'},
          {type: 'note', keys: ['b/4'], duration: '8', accidental: 'n'},
        ]
      },
      {
        endBar: 'single',
        notes: [
        ]
      }
    ],
    bass: [
      {
        endBar: 'single',
        notes: [
          {type: 'note', duration: '8', solfege: 'd'},
          {type: 'note', duration: '8'},
          {type: 'note', duration: '8'},
          {type: 'note', duration: '8'},
        ]
      },
      {
        endBar: 'single',
        notes: [
          {type: 'note', keys: ['a/4'], duration: '8', dotted: true},
          {type: 'note', keys: ['b/4'], duration: '16'},
          {type: 'note', keys: ['c/5'], duration: '4'},
        ]
      },
      {
        endBar: 'single',
        notes: [
          {type: 'note', keys: ['d/5'], duration: '8'},
          {type: 'note', keys: ['e/5'], duration: '8'},
          {type: 'note', keys: ['f/5'], duration: '8'},
          {type: 'note', keys: ['b/4'], duration: '8', accidental: 'n'},
        ]
      },
      {
        endBar: 'single',
        notes: [
        ]
      }
    ]
  },
  rhythm: [
    ['16', true], ['8', true], ['4', true], ['2', true], ['1', true],
    ['16r', true], ['8r', true], ['4r', true], ['2r', true], ['1r', true]
  ],
  solfege: [
    ['t', true], ['l', true], ['s', true], ['fi', true], ['f', true],
    ['m', true], ['r', true], ['d', true]
  ],
  keys: ['E', 'F', 'G'],
  answer: {
    treble: [
      {endBar: 'single', notes: []},
      {endBar: 'single', notes: []},
      {endBar: 'single', notes: []},
      {endBar: 'single', notes: []},
      {endBar: 'single', notes: []},
      {endBar: 'single', notes: []},
      {endBar: 'single', notes: []},
      {endBar: 'end', notes: []},
    ],
    bass: [
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
  meter: {top: 2, bottom: 4},
  measures: 10,
  clefs: ['treble', 'bass'],
  rhythmic: false
};

export default class PSetStudentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vexData,
      rhythmic: true,
      clef: _.first(vexData.clefs)
    };

    this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
    this.saveAndToggle = this.saveAndToggle.bind(this);
    this.saveAndRender = this.saveAndRender.bind(this);
  }

  handleScoreUpdate(score) {
    const newVexData = _.cloneDeep(this.state.vexData);
    const { answer } = newVexData;
    Object.assign(answer, {[this.state.clef]: score});
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

    const { clef } = this.state;
    const score = this.state.vexData.answer[clef];
    const solution = this.state.vexData.score[clef];

    const staveOptions = this.state.vexData.clefs.map((clef) => {
      return (
        <option key={clef} value={clef}>{_.capitalize(clef)}</option>
      );
    });

    if (this.state.rhythmic) {
      entryComponent = (
        <RhythmicEntryComponent options={this.state.vexData.rhythm}
                                score={score}
                                clef={this.state.clef}
                                meter={this.state.vexData.meter}
                                solution={solution}
                                updateScore={this.handleScoreUpdate}
                                save={this.saveAndToggle} />
      );
    } else {
      entryComponent = (
        <MelodicEntryComponent options={this.state.vexData.solfege}
                               score={score}
                               clef={this.state.clef}
                               keys={this.state.vexData.keys}
                               meter={this.state.vexData.meter}
                               solution={solution}
                               updateScore={this.handleScoreUpdate}
                               save={this.saveAndToggle}
                               complete={this.saveAndRender} />
      );
    }

    return (
      <div className="small-12">
        <div className="row">
          <div className="small-12 large-8 small-centered">
            <h3>Ishara Dication #3: {this.state.rhythmic ? 'Rhythmic' : 'Melodic'} Entry</h3>
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
