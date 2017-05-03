import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import _ from 'lodash';

class BoolOptionsEditor extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  handleChange(event) {
    const {target} = event;
    const newValue = target.checked;
    const name = target.name;
    this.props.onChange(
      this.props.options.map((pair) => {
        let [option, value] = pair;
        return (option === name) ? [option, newValue] : pair;
      })
    );
  }

  render() {
    const checkboxes = this.props.options.map((pair) => {
      let [option, value] = pair;
      const optionStyle = {display: 'inline-block'};
      const id = `${this.props.name}_${option}`;
      return (
        <div style={optionStyle} key={id}>
          <input type="checkbox"
                 id={id}
                 name={option}
                 checked={value}
                 onChange={this.handleChange.bind(this)} />
          <label htmlFor={id}>
            {option}
          </label>
        </div>
      );
    });

    return (
      <fieldset className="column column-block">
        <legend>{this.props.name}</legend>
        {checkboxes}
      </fieldset>
    );
  }
}

class PSetOptionsEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = props.pSet;

    this.onNameChange = this.onNameChange.bind(this);
  }

  static propTypes = {
    pSet: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired
  }

  postUpdate(newState) {
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
    this.setState(newState);
    this.postUpdate(newState);
  }

  onNameChange(event) {
    const newState = Object.assign({}, this.state, {name: event.target.value});
    this.setState(newState);
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
          <div className="small-8">
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
        </div>
      </form>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let {pathname} = window.location;
  let parts = pathname.split('/');
  let id = parts[3];
  let url = `/admin/p_sets/${id}.json`;

  $.ajax(url, {method: 'get'}).then((data) => {
    ReactDOM.render(
      <PSetOptionsEditor pSet={data}
                         url={url} />,
      document.getElementById('p_set_options'),
    );
  });
})
