import ReactDOM from 'react-dom';
import PSetOptionsEditor from './components/p_set_options_editor';

function init() {
  document.addEventListener('DOMContentLoaded', () => {
    let {pathname} = window.location;
    let parts = pathname.split('/');
    let id = parts[3];
    let url = `/admin/p_sets/${id}.json`;

    $.ajax(url, {method: 'get'}).then((data) => {
      ReactDOM.render(
        <PSetOptionsEditor pSet={data}
                           url={url} />,
        document.getElementById('p_set_options'),
      );
    });
  });
}

export default {
  init
};
