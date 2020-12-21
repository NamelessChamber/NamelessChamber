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

import ReactDOM from "react-dom"
import createBrowserHistory from "history/createBrowserHistory"

import PSetOptionsEditor from "./components/p_set_options_editor"
import PSetStudentComponent from "./components/p_set_student"
import PSetInstructorComponent from "./components/p_set_instructor"
import PSetAnswerComponent from "./components/p_set_answer"
import { Router, Route, Switch } from "react-router-dom"

function init() {
  document.addEventListener("DOMContentLoaded", () => {
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
      document.getElementById("app-root")
    )
  })
}

export default {
  init,
}
