import React from 'react';
import PropTypes from 'prop-types';

import { newStave } from '../lib/models';

import '../styles/stave_options_editor.css';

const STAVES = {
  treble: 'Treble',
  bass: 'Bass',
  alto: 'Alto',
  tenor: 'Tenor'
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

  updateStaves(action, e) {
    let staves = _.cloneDeep(this.props.staves);

    if (action === 'add') {
      const { currentStave } = this.state;
      let tonicPitch = undefined;
      let scale = undefined;
      if (staves.length > 0) {
        tonicPitch = staves[0].tonic.pitch;
        scale = staves[0].scale;
      }
      staves.push(
        newStave(
          currentStave,
          STAVES[currentStave],
          this.props.measures,
          tonicPitch,
          scale
        )
      );
    } else if (action === 'remove') {
      _.pullAt(staves, this.state.currentPSetStave);
      this.setState({
        currentPSetStave: Math.max(0, this.state.currentPSetStave - 1)
      });
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
    } else if (action === 'tonic') {
      const stave = staves[this.state.currentPSetStave];
      if (e.target.name === 'pitch') {
        staves.forEach((s) =>
          Object.assign(s.tonic, {pitch: e.target.value}
          ));
      } else {
        stave.tonic[e.target.name] = parseInt(e.target.value);
      }
    } else if (action === 'scale') {
      staves.forEach((stave) => {
        stave.scale = e.target.value;
      })
    }

    this.props.updateStaves(staves);
  }

  componentDidMount() {
    $(this.octaveLabelEl).foundation();
  }

  componentDidUpdate() {
    $(this.octaveLabelEl).foundation();
  }

  render() {
    const options = _.map(STAVES, (v, k) => (
      <option key={k} value={k}>{v}</option>
    ));

    const staveOptions = _.map(this.props.staves, (s, i) => (
      <option key={i} value={i}>{STAVES[s.clef]}</option>
    ));

    const emptyOption = (
      <option value={undefined}>-</option>
    );
    let tonicOptions = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    tonicOptions = _.chain(tonicOptions)
                    .flatMap((x) => [x, `${x}#`, `${x}b`])
                    .filter((x) => !_.includes(['E#', 'D#', 'Fb', 'A#', 'B#'], x))
                    .map((x) => (
                      <option key={x} value={x}>{x}</option>
                    ))
                    .value();

    const octaveOptions = _.range(8).map((o) => (
      <option key={o} value={o}>{o}</option>
    ));

    const { staves } = this.props;
    const stave = staves[this.state.currentPSetStave];
    let tonic = {};
    let scale = undefined;
    if (!_.isUndefined(stave)) {
      tonic = stave.tonic;
      scale = stave.scale;
    }
    const staveDetailsStyle = _.isUndefined(stave) ?
                              {display: 'none'} : {};

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
        <div className="row" style={staveDetailsStyle}>
          <div className="small-4 columns"><b>Stave</b></div>
          <div className="small-4 columns"><b>Tonic</b></div>
          <div className="small-4 columns"><b>Scale</b></div>
        </div>
        <div className="row" style={staveDetailsStyle}>
          <div className="small-4 columns">
            <select
              multiple
              value={[this.state.currentPSetStave]}
              onChange={this.updateCurrentStave.bind(this, 'currentPSetStave')}>
              {staveOptions}
            </select>
          </div>
          <div className="small-4 columns">
            <select
              name="pitch"
              value={tonic.pitch}
              onChange={this.updateStaves.bind(this, 'tonic')}>
              {emptyOption}
              {tonicOptions}
            </select>
          </div>
          <div className="small-4 columns">
            <select
              value={scale}
              onChange={this.updateStaves.bind(this, 'scale')}>
              <option value={undefined}>-</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="small-4 columns">
            &nbsp;
          </div>
          <div className="small-4 columns">
            <span data-tooltip
              aria-haspopup="true"
              data-disable-hover="false"
              tabIndex="2"
              className="has-tip top"
              title="The octave to default students on when entering melodic entry mode"
              ref={(el) => this.octaveLabelEl = el}>
              <b>Default Octave</b>
            </span>
          </div>
          <div className="small-4 columns">
            &nbsp;
          </div>
        </div>
        <div className="row">
          <div className="small-4 columns">
            &nbsp;
          </div>
          <div className="small-4 columns">
            <select
              name="octave"
              value={tonic.octave}
              onChange={this.updateStaves.bind(this, 'tonic')}>
              {emptyOption}
              {octaveOptions}
            </select>
          </div>
          <div className="small-4 columns">
            &nbsp;
          </div>
        </div>
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
