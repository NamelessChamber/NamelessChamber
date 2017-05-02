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
    this.state = props.data;
  }

  static propTypes = {
    data: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired
  }

  onOptionsChange(option, values) {
    const update = {[option]: values};
    const newState = Object.assign({}, this.state, update);
    this.setState(newState);
    const params = {
      method: 'put',
      dataType: 'json',
      data: {data: JSON.stringify(newState)}
    };
    $.ajax(this.props.url, params).then((data) => {
      this.setState(data);
    })
  }

  render() {
    const boolSets =
      ['Solfege', 'Rhythm', 'Harmony', 'Inversion', 'Accidental'];
    let boolEditors = boolSets.map((name, i) => {
      const prop = name.toLowerCase();
      const options = this.state[prop];
      const changeFn = this.onOptionsChange.bind(this, prop);
      return (
        <BoolOptionsEditor key={i}
                           options={options}
                           name={name}
                           onChange={changeFn} />
      );
    });

    return (
      <div className="row large-up-3">
        {boolEditors}
      </div>
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // csrf
  const token = $('meta[name="csrf-token"]').attr('content');
  $.ajaxSetup({
    beforeSend: (xhr) => {
      xhr.setRequestHeader('X-CSRF-Token', token);
    }
  });

  let {pathname} = window.location;
  let parts = pathname.split('/');
  let id = parts[3];
  let url = `/admin/p_sets/${id}/data.json`;

  $.ajax(url, {method: 'get'}).then((data) => {
    ReactDOM.render(
      <PSetOptionsEditor data={data}
                         url={url} />,
      document.getElementById('p_set_options'),
    );
  });
})
