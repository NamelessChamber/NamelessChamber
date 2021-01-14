//"Nameless Chamber" - a music dictation web application.
//"Copyright 2020 Massachusetts Institute of Technology"

//This file is part of "Nameless Chamber"

//"Nameless Chamber" is free software: you can redistribute it and/or modify
//it under the terms of the GNU Affero General Public License as published by //the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//"Nameless Chamber" is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU Affero General Public License for more details.

//You should have received a copy of the GNU Affero General Public License
//along with "Nameless Chamber".  If not, see	<https://www.gnu.org/licenses/>.

//Contact Information: garo@mit.edu
//Source Code: https://github.com/NamelessChamber/NamelessChamber

import React from 'react'
import PropTypes from 'prop-types'

export default class BoolOptionsEditor extends React.Component {
  constructor(props) {
    super(props)
  }

  static propTypes = {
    options: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    formatLabel: PropTypes.func,
    labelStyle: PropTypes.object,
  }

  static defaultProps = {
    formatLabel: _.identity,
    labelStyle: {},
  }

  handleChange(event) {
    const { target } = event
    const newValue = target.checked
    const name = target.name
    this.props.onChange(
      this.props.options.map((pair) => {
        let [option, value] = pair
        return option === name ? [option, newValue] : pair
      })
    )
  }

  render() {
    const checkboxes = this.props.options.map((pair) => {
      let [option, value] = pair
      const optionStyle = { display: 'inline-block' }
      const id = `${this.props.name}_${option}`
      return (
        <div style={optionStyle} key={id}>
          <input
            type="checkbox"
            id={id}
            name={option}
            checked={value}
            onChange={this.handleChange.bind(this)}
          />
          <label htmlFor={id} style={this.props.labelStyle}>
            {this.props.formatLabel(option)}
          </label>
        </div>
      )
    })

    return (
      <fieldset className="column column-block">
        <legend>{this.props.name}</legend>
        {checkboxes}
      </fieldset>
    )
  }
}
