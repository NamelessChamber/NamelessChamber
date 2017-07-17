import ReactDOM from 'react-dom';
import PSetOptionsEditor from './components/p_set_options_editor';
import PSetStudentComponent from './components/p_set_student';
import PSetInstructorComponent from './components/p_set_instructor';
import { HashRouter, Route, Switch } from 'react-router-dom';

function init() {
  document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
      <HashRouter>
        <Switch>
          <Route path="/admin/p_sets/:p_set_id/options"
            component={PSetOptionsEditor} />
          <Route path="/admin/p_sets/:p_set_id/staves"
            component={PSetInstructorComponent} />
          <Route path="/p_sets/:p_set_id" component={PSetStudentComponent} />
          <Route path="/" component={PSetStudentComponent} />
        </Switch>
      </HashRouter>,
      document.getElementById('app-root'),
    );
  });
}

export default {
  init
};
