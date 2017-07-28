import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import BoolOptionsEditor from './bool_options_editor';
import StaveOptionsEditor from './stave_options_editor';
import { newPSet, formatKey, validateOptions } from '../lib/models';
import { fetchPSet, updatePSet } from '../lib/api';

import '../styles/p_set_options_editor.css';

export default class PSetOptionsEditor extends React.Component {
  constructor(props) {
    super(props);
    this.onNameChange = this.onNameChange.bind(this);
    this.onMeterChange = this.onMeterChange.bind(this);
    this.onMeasuresChange = this.onMeasuresChange.bind(this);
    this.onStavesChange = this.onStavesChange.bind(this);
    this.state = {};
  }

  static propTypes = {
    match: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { p_set_id } = this.props.match.params;
    fetchPSet(p_set_id).then((pSet) => {
      this.setState(pSet);
    }).catch((e) => {
      console.log(e.status);
    });
  }

  postUpdateXhr = _.debounce((newState) => {
    const { p_set_id } = this.props.match.params;
    updatePSet(p_set_id, newState).then((pSet) => {
      this.setState(pSet);
      this.posting = false;
    }).catch((e) => {
      console.log(e.status);
      this.posting = false;
    });
  }, 1000)

  postUpdate(newState) {
    this.setState(newState);
    this.posting = true;
    this.postUpdateXhr(newState);
  }

  onOptionsChange(option, values) {
    const update = {[option]: values};
    const newOptions = Object.assign({}, this.state.data.options, update);
    const newData = Object.assign({}, this.state.data, {options: newOptions});
    const newState = Object.assign({}, this.state, {data: newData});
    this.postUpdate(newState);
  }

  onNameChange(event) {
    const newState = Object.assign({}, this.state, {name: event.target.value});
    this.postUpdate(newState);
  }

  onMeterChange(event) {
    let {name, value} = event.target;
    value = Math.max(0, parseInt(value));
    const newState = Object.assign({}, this.state);
    newState.data.meter[name] = value;
    this.postUpdate(newState);
  }

  onStavesChange(staves) {
    const newData = Object.assign({}, this.state.data, {staves});
    const newState = Object.assign({}, this.state, {data: newData});
    this.postUpdate(newState);
  }

  onMeasuresChange(e) {
    const newState = _.cloneDeep(this.state);
    let { value } = e.target;
    value = parseInt(value);
    _.set(newState, 'data.measures', value);
    _.update(newState, 'data.staves', (staves) => {
      return _.map(staves, (stave) => {
        _.update(stave, 'solution', (solution) => {
          if (solution.length > value) {
            return _.slice(solution, 0, value);
          } else {
            const newMeasures = _.map(_.range(value - solution.length),
                                      () => {
                                        return {notes: []};
                                      });
            return _.chain(solution)
                    .concat(newMeasures)
                    .map((m, i) => {
                      const endBar = (i === value - 1) ?
                                     'end' : 'single';
                      return _.assign(m, {endBar});
                    })
                    .value();
          }
        });
        return _.update(stave, 'answer', (answer) => {
          const newMeasures = _.map(_.range(value),
                                    () => {
                                      return {notes: []};
                                    });

          return _.map(newMeasures, (m, i) => {
                    const endBar = (i === value - 1) ?
                                   'end' : 'single';
                    return _.assign(m, {endBar});
                  });
        });
      });
    });
    this.postUpdate(newState);
  }

  toRhythmicEntry(e) {
    e.preventDefault();
    const errors = validateOptions(this.state.data);
    if (_.isUndefined(errors)) {
      this.props.history.push('rhythm');
    } else {
      alert(errors.join("\n"));
    }
  }

  render() {
    if (_.isUndefined(this.state.data) || _.isNull(this.state.data)) {
      return (
        <div></div>
      );
    }

    const boolSets =
      ['Solfege', 'Rhythm', 'Harmony', 'Inversion'];
    let boolEditors = boolSets.map((name, i) => {
      const prop = name.toLowerCase();
      const options = this.state.data.options[prop];
      const changeFn = this.onOptionsChange.bind(this, prop);
      return (
        <BoolOptionsEditor key={i}
          options={options}
          name={name}
          onChange={changeFn} />
      );
    });

    return (
      <div className="small-12 columns">
        <div className="row large-up-3">
          <fieldset className="column column-block">
            <legend>Name</legend>
            <input
              autoComplete="off" autoCorrect="off" autoCapitalize="off"
              name="name"
              type="text"
              value={this.state.name}
              onChange={this.onNameChange} />
            <legend>Measures</legend>
            <input type="number"
              name="measures"
              className="meter-input"
              value={this.state.data.measures}
              onChange={this.onMeasuresChange} />
          </fieldset>
          <fieldset className="column column-block">
            <legend>Meter</legend>
            <input type="number"
              name="top"
              className="meter-input"
              value={this.state.data.meter.top}
              onChange={this.onMeterChange} />
            /
            <input type="number"
              name="bottom"
              className="meter-input"
              value={this.state.data.meter.bottom}
              onChange={this.onMeterChange} />
         </fieldset>
          <fieldset className="column column-block">
            <legend>Proceed</legend>
            <button className="button"
              onClick={this.toRhythmicEntry.bind(this)}>
              Proceed to Music Entry
            </button>
          </fieldset>

          {boolEditors}

          <BoolOptionsEditor
            options={this.state.data.options.key}
            name="Key"
            onChange={this.onOptionsChange.bind(this, 'key')}
            formatLabel={formatKey} />

          <StaveOptionsEditor
            measures={this.state.data.measures}
            staves={this.state.data.staves}
            updateStaves={this.onStavesChange} />
        </div>
      </div>
    );
  }
}
