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





import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';

import { fetchPSetAnswerAdmin, fetchPSet } from '../lib/api';
import { getAnswerErrors, keyOptionToSignature, currentPage } from '../lib/utils';

export default class PSetAnswerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submission: 0,
      measure: 0
    };
  }

  componentDidMount() {
    const { p_set_answer_id } = this.props.match.params;
    fetchPSetAnswerAdmin(p_set_answer_id).then((answer) => {
      const { p_set_id } = answer;
      return fetchPSet(p_set_id).then((pSet) => {
        this.setState({pSet, answer});
      });
    });
  }

  updateMeasure(increment) {
    const measures = this.state.pSet.data.measures;
    let { measure } = this.state;
    if (increment) {
      measure = Math.min(measure + 1, measures - 1);
    } else {
      measure = Math.max(0, measure - 1);
    }
    this.setState({measure});
  }

  updateSubmission(increment) {
    const answer = this.state.answer.data;
    let { submission } = this.state;
    const submissions = answer.submissions.length;
    if (increment) {
      submission = Math.min(submission + 1, submissions - 1);
    } else {
      submission = Math.max(0, submission - 1);
    }
    this.setState({submission});
  }

  render() {
    if (_.isUndefined(this.state.answer)) {
      return (<div className="row columns">Loading...</div>)
    }

    let { pSet, answer, measure } = this.state;
    pSet = pSet.data;
    const submission = answer.data.submissions[this.state.submission];
    const totalSubmissions = answer.data.submissions.length;

    const vfStaves = _.zipWith(
      pSet.staves,
      submission.staves,
      (s, a) => {
        return Object.assign(s, {answer: a});
      });

    const staveErrors = getAnswerErrors(pSet.staves, submission.staves, 'harmony');

    const measures = pSet.measures;

    return (
      <div className="row">
        <div className="small-10 columns">
          <VexflowComponent
            staves={pSet.staves}
            meter={submission.meter}
            render="answer"
            mode={VexflowComponent.RenderMode.MELODIC}
            keySignature={keyOptionToSignature(submission.keySignature)}
            currentMeasure={measure}
            currentNote={0}
            editing={0}
            measures={pSet.measures}
            staveErrors={staveErrors} />
        </div>
        <div className="small-2 columns">
          <fieldset>
            <legend>Submission {this.state.submission + 1} / {totalSubmissions}</legend>
            <button className="button"
              onClick={this.updateSubmission.bind(this, false)}>
              &lt;&lt;
            </button>
            &nbsp;
            <button className="button"
              onClick={this.updateSubmission.bind(this, true)}>
              &gt;&gt;
            </button>
            <p>
              Submitted at: {submission.created_at}
            </p>
          </fieldset>
          <fieldset>
            <legend>Measure {this.state.measure + 1} / {measures}</legend>
            <button className="button"
              onClick={this.updateMeasure.bind(this, false)}>
              &lt;&lt;
            </button>
            &nbsp;
            <button className="button"
              onClick={this.updateMeasure.bind(this, true)}>
              &gt;&gt;
            </button>
          </fieldset>
        </div>
      </div>
    )
  }
}
