import React from 'react';
import PropTypes from 'prop-types';

import { newStave } from '../lib/models';

const STAVES = {
  treble: 'Treble',
  bass: 'Bass',
  alto: 'Alto',
  tenor: 'Tenor',
  soprano: 'Soprano',
  'mezzo-soprano': 'Mezzo-Soprano',
  'baritone-c': 'Baritone (C Clef)',
  'baritone-f': 'Baritone (F Clef)'
};

export default class StaveOptionsEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentStave: _.head(_.keys(STAVES)),
      currentPSetStave: 0
    };

    this.updateStaves = this.updateStaves.bind(this);
  }

  static propTypes = {
    staves: PropTypes.array.isRequired,
    updateStaves: PropTypes.func.isRequired,
    measures: PropTypes.number.isRequired
  }

  updateCurrentStave(key, e) {
    this.setState({[key]: e.target.value});
  }

  updateStaves(action) {
    let staves = _.cloneDeep(this.props.staves);

    if (action === 'add') {
      const { currentStave } = this.state;
      staves.push(
        newStave(
          currentStave,
          STAVES[currentStave],
          this.props.measures
        )
      );
    } else if (action === 'remove') {
      _.pullAt(staves, this.state.currentPSetStave);
    } else if (action === 'up') {
      if (this.state.currentPSetStave > 0) {
        const prev = this.state.currentPSetStave - 1;
        const old = staves[prev];
        staves[prev] = staves[prev + 1];
        staves[prev + 1] = old;
        this.setState({currentPSetStave: prev});
      }
    } else if (action === 'down') {
      const len = staves.length;
      if (this.state.currentPSetStave < len - 1) {
        const next = this.state.currentPSetStave + 1;
        const old = staves[next];
        staves[next] = staves[next - 1];
        staves[next - 1] = old;
        this.setState({currentPSetStave: next});
      }
    }

    this.props.updateStaves(staves);
  }

  render() {
    const options = _.map(STAVES, (v, k) => (
      <option key={k} value={k}>{v}</option>
    ));

    const staves = _.map(this.props.staves, (s, i) => (
      <option key={i} value={i}>{STAVES[s.clef]}</option>
    ));

    return (
      <fieldset className="column column-block">
        <legend>Staves</legend>
        <select
          multiple
          value={[this.state.currentStave]}
          onChange={this.updateCurrentStave.bind(this, 'currentStave')}>
          {options}
        </select>
        <button
          className="button"
          onClick={() => this.updateStaves('add')}>
          Add Stave
        </button>
        <legend>Current Staves:</legend>
        <select
          multiple
          value={[this.state.currentPSetStave]}
          onChange={this.updateCurrentStave.bind(this, 'currentPSetStave')}>
          {staves}
        </select>
        <div className="row">
          <div className="small-4 columns">
            <button
              className="button"
              style={{width: '100%'}}
              onClick={() => this.updateStaves('remove')}>
              Remove
            </button>
          </div>
          <div className="small-4 columns">
            <button
              className="button"
              style={{width: '100%'}}
              onClick={() => this.updateStaves('up')}>
              Up
            </button>
          </div>
          <div className="small-4 columns">
            <button
              className="button"
              style={{width: '100%'}}
              onClick={() => this.updateStaves('down')}>
              Down
            </button>
          </div>
        </div>
      </fieldset>
    );
  }
}
