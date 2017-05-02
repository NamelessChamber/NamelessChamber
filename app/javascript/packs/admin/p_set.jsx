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
    let checkboxes = this.props.options.map((pair) => {
      let [option, value] = pair;
      return [(
        <input type="checkbox"
               key={option + '_box'}
               id={option}
               name={option}
               checked={value}
               onChange={this.handleChange.bind(this)} />
      ), (
        <label key={option} htmlFor={option}>
          {option}
        </label>
      )];
    });
    checkboxes = _.flatten(checkboxes);

    return (
      <div className="row">
        <fieldset className="large-6 columns">
          <legend>{this.props.name}</legend>
          {checkboxes}
        </fieldset>
      </div>
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
    let {solfege} = this.state;
    return (
      <div className="row">
        <BoolOptionsEditor options={solfege}
                           name="Solfege"
                           onChange={this.onOptionsChange.bind(this, 'solfege')} />
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
