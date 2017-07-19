import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import BoolOptionsEditor from './bool_options_editor';
import StaveOptionsEditor from './stave_options_editor';
import { newPSet } from '../lib/models';

import '../styles/p_set_options_editor.css';

function pSetUrl(id) {
  return `/admin/p_sets/${id}.json`;
}

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

  pSetUrlBase(page) {
    const { p_set_id } = this.props.match.params;
    return `/admin/p_sets/${p_set_id}/${page}`;
  }

  componentDidMount() {
    const { p_set_id } = this.props.match.params;
    const params = {method: 'get', dataType: 'json'};
    const url = pSetUrl(p_set_id);
    let pSet = window.localStorage.getItem(url);
    if (_.isUndefined(pSet) || _.isNull(pSet)) {
      pSet = newPSet();
      window.localStorage.setItem(url, JSON.stringify(pSet));
    } else {
      try {
        pSet = JSON.parse(pSet);
      } catch (e) {
        console.log('error', e);
        pSet = newPSet();
        window.localStorage.setItem(url, JSON.stringify(pSet));
      }
    }
    this.setState(pSet);
    /* $.ajax(pSetUrl(p_set_id), params).then((data) => {
     *   this.setState(data);
     * });*/
  }

  postUpdate(newState) {
    this.setState(newState);
    const { p_set_id } = this.props.match.params;
    window.localStorage.setItem(pSetUrl(p_set_id), JSON.stringify(newState));
    /* const params = {
     *   method: 'put',
     *   dataType: 'json',
     *   data: {p_set: newState}
     * };
     * $.ajax(this.props.url, params).then((data) => {
     *   this.setState(data);
     * });*/
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
    const {name, value} = event.target;
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
        return _.update(stave, 'solution', (solution) => {
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
      });
    });
    this.postUpdate(newState);
  }

  render() {
    if (_.isUndefined(this.state.data) || _.isNull(this.state.data)) {
      return (
        <div></div>
      );
    }

    const boolSets =
      ['Solfege', 'Rhythm', 'Harmony', 'Inversion', 'Key'];
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
      <div>
        <div className="row large-up-3">
          <fieldset className="column column-block">
            <legend>Name</legend>
            <input
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
            <Link className="button" to={this.pSetUrlBase('staves')}>
              Proceed to Music Entry
            </Link>
          </fieldset>

          {boolEditors}

          <StaveOptionsEditor
            measures={this.state.data.measures}
            staves={this.state.data.staves}
            updateStaves={this.onStavesChange} />
        </div>
      </div>
    );
  }
}
