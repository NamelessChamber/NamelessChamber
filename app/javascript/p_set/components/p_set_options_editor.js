import React from 'react';
import PropTypes from 'prop-types';
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
    this.onStavesChange = this.onStavesChange.bind(this);
    this.state = {};
  }

  static propTypes = {
    match: PropTypes.object.isRequired
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

  render() {
    if (_.isUndefined(this.state.data) || _.isNull(this.state.data)) {
      return (
        <form></form>
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
        <div className="row">
          <div className="small-8 columns">
            <label htmlFor="name">
              Name
              <input name="name"
                     type="text"
                     value={this.state.name}
                     onChange={this.onNameChange} />
            </label>
          </div>
        </div>
        <div className="row large-up-3">
          {boolEditors}
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
          <div className="column column-block">
            <StaveOptionsEditor
              staves={this.state.data.staves}
              updateStaves={this.onStavesChange} />
          </div>
        </div>
      </div>
    );
  }
}
