import ReactDOM from 'react-dom';
import PSetOptionsEditor from './components/p_set_options_editor';
import VexflowComponent from './components/vexflow';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

function init() {
  document.addEventListener('DOMContentLoaded', () => {
    let {pathname} = window.location;
    let parts = pathname.split('/');
    let id = parts[3];
    let url = `/admin/p_sets/${id}.json`;

    ReactDOM.render(
      <BrowserRouter>
        <Switch>
          <Route path="/admin/p_sets/:p_set_id/edit"
                 component={PSetOptionsEditor} />
          <Route path="/" component={VexflowComponent} />
        </Switch>
      </BrowserRouter>,
      document.getElementById('app-root'),
    );
  });
}

export default {
  init
};
