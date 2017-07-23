import ReactDOM from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import PSetOptionsEditor from './components/p_set_options_editor';
import PSetStudentComponent from './components/p_set_student';
import PSetInstructorComponent from './components/p_set_instructor';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

function init() {
  document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
      <BrowserRouter history={createBrowserHistory()}>
        <Switch>
          <Route exact path="/admin/p_sets/:p_set_id/options"
            component={PSetOptionsEditor} />
          <Route exact path="/admin/p_sets/:p_set_id/rhythm"
            component={PSetInstructorComponent} />
          <Route exact path="/admin/p_sets/:p_set_id/melody"
            component={PSetInstructorComponent} />
          <Route exact path="/p_sets/:p_set_id/melody"
            component={PSetStudentComponent} />
          <Route exact path="/p_sets/:p_set_id/rhythm"
            component={PSetStudentComponent} />
        </Switch>
      </BrowserRouter>,
      document.getElementById('app-root'),
    );
  });
}

export default {
  init
};
