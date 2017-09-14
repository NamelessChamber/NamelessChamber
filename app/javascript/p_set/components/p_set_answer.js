import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';

import { fetchPSetAnswerAdmin, fetchPSet } from '../lib/api';

export default class PSetAnswerComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      submission: 0,
      page: 0
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

  updatePage(increment) {
    const pages = Math.ceil(this.state.pSet.data.measures / 4);
    let { page } = this.state;
    if (increment) {
      page = Math.min(page + 1, pages - 1);
    } else {
      page = Math.max(0, page - 1);
    }
    this.setState({page});
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

    let { pSet, answer } = this.state;
    pSet = pSet.data;
    const submission = answer.data.submissions[this.state.submission];
    const totalSubmissions = answer.data.submissions.length;

    const vfStaves = _.zipWith(
      pSet.staves,
      submission.staves,
      (s, a) => {
        return Object.assign(s, {answer: a});
      });

    const pages = Math.ceil(pSet.measures / 4);

    return (
      <div className="row">
        <div className="small-10 columns">
          <VexflowComponent
            staves={pSet.staves}
            meter={submission.meter}
            render="answer"
            mode={VexflowComponent.RenderMode.MELODIC}
            keySignature={submission.keySignature}
            startMeasure={this.state.page * 4}
            measures={pSet.measures} />
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
            <legend>Page {this.state.page + 1} / {pages}</legend>
            <button className="button"
              onClick={this.updatePage.bind(this, false)}>
              &lt;&lt;
            </button>
            &nbsp;
            <button className="button"
              onClick={this.updatePage.bind(this, true)}>
              &gt;&gt;
            </button>
          </fieldset>
        </div>
      </div>
    )
  }
}
