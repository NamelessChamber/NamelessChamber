import React from 'react';
import PropTypes from 'prop-types';

export default class BoolOptionsEditor extends React.Component {
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
