import React from 'react';
import PropTypes from 'prop-types';

import BoolOptionsEditor from './bool_options_editor';

import '../styles/p_set_options_editor.css';

export default class PSetOptionsEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.pSet;

    this.onNameChange = this.onNameChange.bind(this);
    this.onMeterChange = this.onMeterChange.bind(this);
  }

  static propTypes = {
    pSet: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired
  }

  postUpdate(newState) {
    this.setState(newState);
    const params = {
      method: 'put',
      dataType: 'json',
      data: {p_set: newState}
    };
    $.ajax(this.props.url, params).then((data) => {
      this.setState(data);
    });
  }

  onOptionsChange(option, values) {
    const update = {[option]: values};
    const newData = Object.assign({}, this.state.data, update);
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

  render() {
    const boolSets =
      ['Solfege', 'Rhythm', 'Harmony', 'Inversion', 'Accidental'];
    let boolEditors = boolSets.map((name, i) => {
      const prop = name.toLowerCase();
      const options = this.state.data[prop];
      const changeFn = this.onOptionsChange.bind(this, prop);
      return (
        <BoolOptionsEditor key={i}
                           options={options}
                           name={name}
                           onChange={changeFn} />
      );
    });

    return (
      <form>
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
        </div>
        <div className="row">
          <div className="small-6 columns">
              <label>
                <p>Meter</p>
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
              </label>
          </div>
          <div className="small-6 columns">

          </div>
        </div>
      </form>
    );
  }
}
