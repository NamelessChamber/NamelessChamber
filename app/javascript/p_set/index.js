import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'

import PSetOptionsEditor from './components/p_set_options_editor'
import PSetStudentComponent from './components/p_set_student'
import PSetInstructorComponent from './components/p_set_instructor'
import PSetAnswerComponent from './components/p_set_answer'
import { Router, Route, Switch } from 'react-router-dom'

function init() {
  document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
      <Router history={createBrowserHistory()}>
        <Switch>
          <Route
            exact
            path="/admin/p_sets/:p_set_id/options"
            component={PSetOptionsEditor}
          />
          <Route
            exact
            path="/admin/p_sets/:p_set_id/rhythm"
            component={PSetInstructorComponent}
          />
          <Route
            exact
            path="/admin/p_sets/:p_set_id/melody"
            component={PSetInstructorComponent}
          />
          <Route
            exact
            path="/admin/p_sets/:p_set_id/harmony"
            component={PSetInstructorComponent}
          />
          <Route
            exact
            path="/admin/p_set_answers/:p_set_answer_id"
            component={PSetAnswerComponent}
          />
          <Route
            exact
            path="/p_sets/:p_set_id/melody"
            component={PSetStudentComponent}
          />
          <Route
            exact
            path="/p_sets/:p_set_id/rhythm"
            component={PSetStudentComponent}
          />
          <Route
            exact
            path="/p_sets/:p_set_id/harmony"
            component={PSetStudentComponent}
          />
        </Switch>
      </Router>,
      document.getElementById('app-root')
    )
  })
}

export default {
  init,
}
