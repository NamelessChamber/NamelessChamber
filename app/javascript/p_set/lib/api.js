import { newPSet } from './models';

export function fetchPSet(id) {
  const url = `/admin/p_sets/${id}.json`;
  return $.ajax({
    url,
    method: 'GET'
  }).done((pSet) => {
    if (_.isEmpty(pSet.data)) {
      pSet.data = newPSet();
    }

    return pSet;
  });
}

export function updatePSet(id, pSet) {
  const url = `/admin/p_sets/${id}.json`;
  return $.ajax({
    url,
    method: 'PUT',
    data: {p_set: {
      name: pSet.name,
      data: JSON.stringify(pSet.data)
    }} });
}
