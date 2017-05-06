import React from 'react';
import PropTypes from 'prop-types';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';

const vexData = {
  score: [
    {
      endBar: 'single',
      notes: [
        {type: 'note', keys: ['f/4'], duration: '8'},
        {type: 'note', keys: ['a/4'], duration: '8'},
        {type: 'note', keys: ['a/4'], duration: '8'},
        {type: 'note', keys: ['a/4'], duration: '8'},
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
      endBar: 'end',
      notes: [
        {type: 'note', keys: ['d/5'], duration: '8'},
        {type: 'note', keys: ['e/5'], duration: '8'},
        {type: 'note', keys: ['f/5'], duration: '8'},
        {type: 'note', keys: ['b/4'], duration: '8', accidental: 'n'},
      ]
    }
  ],
  rhythm: [
    ['8', true], ['4', true], ['2', true], ['1', true], ['8r', true],
    ['4r', true], ['2r', true], ['1r', true]
  ],
  solfege: [
    ['d', true], ['r', true], ['m', true], ['f', true], ['s', true],
    ['l', true], ['t', true]
  ],
  answer: [
    {endBar: 'single', notes: []},
    {endBar: 'single', notes: []},
    {endBar: 'single', notes: []},
    {endBar: 'single', notes: []},
    {endBar: 'single', notes: []},
    {endBar: 'single', notes: []},
    {endBar: 'single', notes: []},
    {endBar: 'end', notes: []},
  ],
  meter: {top: 2, bottom: 4},
  measures: 10,
  clef: 'treble',
  rhythmic: false
};

export default class PSetStudentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vexData
    };

    this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
  }

  handleScoreUpdate(score) {
    const newVexData = Object.assign({}, this.state.vexData);
    this.setState({
      vexData: Object.assign(newVexData, {answer: score})
    });
  }

  render() {
    return (
      <div className="small-12">
        <div className="row">
          <div className="small-12 large-8 small-centered">
            <h3>Practice PSet: Rhythmic Entry</h3>
          </div>
        </div>
        <div className="row">
          <div className="small-12 large-8 small-centered">
            <VexflowComponent {...this.state.vexData} />
          </div>
        </div>
        <RhythmicEntryComponent options={this.state.vexData.rhythm}
                                score={this.state.vexData.answer}
                                clef={this.state.vexData.clef}
                                meter={this.state.vexData.meter}
                                updateScore={this.handleScoreUpdate} />
        {/* <div className="row">
          <div className="small-12 large-8 large-centered">
            <div className="row large-up-6">
              <div className="column column-block">
                <form>
                  <select multiple style={{width: '40px', height: '230px'}}>
                    <option value="si">si</option>
                    <option value="fi">fi</option>
                    <option value="ri">ri</option>
                    <option value="di">di</option>
                    <option value="t">t</option>
                    <option value="l">l</option>
                    <option value="s">s</option>
                    <option value="m">m</option>
                    <option value="r">r</option>
                    <option value="d">d</option>
                  </select>
                  <br />
                  <input type="submit" className="button" value="Add" />
                </form>
              </div>
              <div className="column column-block">
                <form>
                  <legend>
                    Octave (3)
                    <p>
                      <input type="submit" className="button" value="+" />
                    </p>
                    <p>
                      <input type="submit" className="button" value="-" />
                    </p>
                    <p>
                      <input type="submit" className="button" value="Undo" />
                    </p>
                  </legend>
                </form>
              </div>
              <div className="column column-block">
                Current note: 5
              </div>
              <div className="column column-block">
                &nbsp;
              </div>
              <div className="column column-block">
                &nbsp;
              </div>
              <div className="column column-block">
                <form>
                  <input type="submit" className="button" value="Save" />
                </form>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    );
  }
}
