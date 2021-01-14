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

import { newPSet } from "./utils"

function railsFetch(url, options) {
  const token = $('meta[name="csrf-token"]').attr("content")
  options = _.merge(
    {
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-Token": token,
        "Content-Type": "application/json",
      },
    },
    options
  )

  let { queryParams } = options

  if (_.isObject(queryParams)) {
    _.unset(options.queryParams)
    queryParams = _.map((v, k, i) => {
      v = encodeURIComponent(v)
      return `${k}=${v}`
    }).join("&")

    if (url.indexOf("?") > -1) {
      url = `${url}&${queryParams}`
    } else {
      url = `${url}?${queryParams}`
    }
  }

  if (_.isObject(options.body)) {
    options.body = JSON.stringify(options.body)
  }

  return fetch(url, options)
}

export function fetchPSet(id, admin) {
  const prefix = admin ? "/admin" : ""
  const url = `${prefix}/p_sets/${id}.json`
  return railsFetch(url, { method: "GET" }).then((data) => {
    return data.json().then((pSet) => {
      if (admin && _.isEmpty(pSet.data)) {
        pSet.data = newPSet()
      }

      return pSet
    })
  })
}

export function updatePSet(id, pSet, admin) {
  // boolify it
  const prefix = admin ? "/admin" : ""
  const url = `${prefix}/p_sets/${id}.json`
  const data = {
    p_set: {
      name: pSet.name,
      data: pSet.data,
    },
  }
  return railsFetch(url, {
    method: "PUT",
    body: data,
  }).then((data) => data.json())
}

export function fetchPSetAnswer(id) {
  const url = `/p_sets/${id}/answer.json`
  return railsFetch(url, { method: "GET" }).then((data) => {
    return data.json().then(({ answer }) => answer)
  })
}

export function updatePSetAnswer(id, answer, submission, completed) {
  completed = completed || false
  submission = submission || false
  const url = `/p_sets/${id}/answer.json`
  const data = { answer, completed, submission }
  return railsFetch(url, {
    method: "PUT",
    body: data,
  }).then((data) => data.json())
}

export function fetchPSetAnswerAdmin(id) {
  const url = `/admin/p_set_answers/${id}.json`
  return railsFetch(url, { method: "GET" }).then((data) => data.json())
}

export function deletePSetAudio(pSetId, pSetAudioId) {
  const url = `/admin/p_sets/${pSetId}/audios/${pSetAudioId}.json`
  return railsFetch(url, { method: "DELETE" }).then((data) => data.json())
}
