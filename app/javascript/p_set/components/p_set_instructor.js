import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';
import { newPSet } from '../lib/models';


function pSetUrl(id) {
  return `/admin/p_sets/${id}.json`;
}

export default class PSetInstructorComponent extends React.Component {
  constructor(props) {
    super();

    this.state = {};
  }

  componentDidMount() {
    const { p_set_id } = this.props.match.params;
    const url = pSetUrl(p_set_id);
    let pSet = window.localStorage.getItem(url);
    if (_.isUndefined(pSet)) {
      alert('No PSet found by this ID!');
    } else {
      pSet = JSON.parse(pSet);
      this.setState({pSet});
    }
  }

  render() {

    return (
      <div className="small-12" ref={(el) => this.containerEl = el}>
        <div className="row">
          <div className="small-12 large-10 small-centered">
            testing
          </div>
        </div>
      </div>
    );
  }
}

