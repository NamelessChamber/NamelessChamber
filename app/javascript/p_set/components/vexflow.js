import React from 'react';
import PropTypes from 'prop-types';
import Vex from 'vexflow';

const VF = Vex.Flow;

export default class VexflowComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>Hello</div>
    );
  }
}
