import { newPSet } from './models';

function railsFetch(url, options) {
  const token = $('meta[name="csrf-token"]').attr('content');
  options = _.merge({
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': token
    }
  }, options);

  return fetch(url, options);
}

export function fetchPSet(id) {
  const url = `/admin/p_sets/${id}.json`;
  return railsFetch(url, {method: 'GET'}).then((data) => {
    return data.json().then((pSet) => {
      if (_.isEmpty(pSet.data)) {
        pSet.data = newPSet();
      }

      return pSet;
    });
  });
}

export function updatePSet(id, pSet) {
  const url = `/admin/p_sets/${id}.json`;
  const data = new FormData();
  data.append('p_set[name]', pSet.name);
  data.append('p_set[data]', JSON.stringify(pSet.data));
  return railsFetch(url, {
    method: 'PUT',
    body: data
  }).then((data) => data.json());
}
