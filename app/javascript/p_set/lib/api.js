import { newPSet } from './models';

function railsFetch(url, options) {
  const token = $('meta[name="csrf-token"]').attr('content');
  options = _.merge({
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': token,
      'Content-Type': 'application/json'
    }
  }, options);

  if (_.isObject(options.body)) {
    options.body = JSON.stringify(options.body);
  }

  return fetch(url, options);
}

export function fetchPSet(id, admin) {
  const prefix = admin ? '/admin' : '';
  const url = `${prefix}/p_sets/${id}.json`;
  return railsFetch(url, {method: 'GET'}).then((data) => {
    return data.json().then((pSet) => {
      if (admin && _.isEmpty(pSet.data)) {
        pSet.data = newPSet();
      }

      return pSet;
    });
  });
}

export function updatePSet(id, pSet, admin, completed) {
  // boolify it
  completed = completed || false;
  const prefix = admin ? '/admin' : '';
  const url = `${prefix}/p_sets/${id}.json`;
  const data = {
    p_set: {
      name: pSet.name,
      data: pSet.data,
      completed
    }
  };
  return railsFetch(url, {
    method: 'PUT',
    body: data
  }).then((data) => data.json());
}

export function fetchPSetAnswer(id) {
  const url = `/p_sets/${id}/answer.json`;
  return railsFetch(url, {method: 'GET'}).then((data) => {
    return data.json().then(({answer}) => answer);
  });
}

export function updatePSetAnswer(id, answer) {
  const url = `/p_sets/${id}/answer.json`;
  const data = {answer};
  return railsFetch(url, {
    method: 'PUT',
    body: data
  }).then((data) => data.json());
}
