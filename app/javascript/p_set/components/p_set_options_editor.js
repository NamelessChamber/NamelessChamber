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

import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import ReactAudioPlayer from 'react-audio-player'

import BoolOptionsEditor from './bool_options_editor'
import StaveOptionsEditor from './stave_options_editor'
import {
  newPSet,
  formatKey,
  validateOptions,
  durationString,
} from '../lib/utils'
import { fetchPSet, updatePSet, deletePSetAudio } from '../lib/api'

import '../styles/p_set_options_editor.css'

export default class PSetOptionsEditor extends React.Component {
  constructor(props) {
    super(props)
    this.onNameChange = this.onNameChange.bind(this)
    this.onMeterChange = this.onMeterChange.bind(this)
    this.onMeasuresChange = this.onMeasuresChange.bind(this)
    this.onPickUpChange = this.onPickUpChange.bind(this)
    this.onStavesChange = this.onStavesChange.bind(this)
    this.state = {}
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
  }

  componentDidMount() {
    const { p_set_id } = this.props.match.params
    fetchPSet(p_set_id, true)
      .then((pSet) => {
        this.setState(pSet)
      })
      .catch((e) => {
        console.log(e, e.status)
      })
  }

  postUpdateXhr = _.debounce((newState) => {
    const { p_set_id } = this.props.match.params
    updatePSet(p_set_id, newState, true)
      .then((pSet) => {
        this.setState(pSet)
        this.posting = false
      })
      .catch((e) => {
        console.log(e.status)
        this.posting = false
      })
  }, 1000)

  postUpdate(newState) {
    this.setState(newState)
    this.posting = true
    this.postUpdateXhr(newState)
  }

  onOptionsChange(option, values) {
    const update = { [option]: values }
    const newOptions = Object.assign({}, this.state.data.options, update)
    const newData = Object.assign({}, this.state.data, { options: newOptions })
    const newState = Object.assign({}, this.state, { data: newData })
    this.postUpdate(newState)
  }

  onPickUpChange(e) {
    const newState = _.cloneDeep(this.state)
    const { checked } = e.target
    newState.data.pickUpBeat = checked
    if (newState.data.measures > 0) {
      if (checked) {
        _.each(newState.data.staves, (stave) => {
          const [measure] = stave.solution
          measure.endBar = 'double'
        })
      } else {
        _.each(newState.data.staves, (stave) => {
          const [measure] = stave.solution
          measure.endBar = 'single'
        })
      }
    }
    this.postUpdate(newState)
  }

  onNameChange(event) {
    const newState = Object.assign({}, this.state, { name: event.target.value })
    this.postUpdate(newState)
  }

  onMeterChange(event) {
    let { name, value } = event.target
    value = Math.max(0, parseInt(value))
    const newState = Object.assign({}, this.state)
    newState.data.meter[name] = value
    this.postUpdate(newState)
  }

  onStavesChange(staves) {
    const newData = Object.assign({}, this.state.data, { staves })
    const newState = Object.assign({}, this.state, { data: newData })
    this.postUpdate(newState)
  }

  onMeasuresChange(e) {
    const newState = _.cloneDeep(this.state)
    let { value } = e.target
    value = Math.max(parseInt(value), 1)
    _.set(newState, 'data.measures', value)
    _.update(newState, 'data.staves', (staves) => {
      return _.map(staves, (stave) => {
        _.update(stave, 'solution', (solution) => {
          if (solution.length > value) {
            return _.slice(solution, 0, value)
          } else {
            const newMeasures = _.map(_.range(value - solution.length), () => {
              return { notes: [] }
            })
            return _.chain(solution)
              .concat(newMeasures)
              .map((m, i) => {
                const endBar = i === value - 1 ? 'end' : 'single'
                return _.assign(m, { endBar })
              })
              .value()
          }
        })
        return _.update(stave, 'answer', (answer) => {
          const newMeasures = _.map(_.range(value), () => {
            return { notes: [] }
          })

          return _.map(newMeasures, (m, i) => {
            const endBar = i === value - 1 ? 'end' : 'single'
            return _.assign(m, { endBar })
          })
        })
      })
    })
    this.postUpdate(newState)
  }

  toRhythmicEntry(e) {
    e.preventDefault()
    const errors = validateOptions(this.state.data)
    if (_.isUndefined(errors)) {
      this.props.history.push('rhythm')
    } else {
      alert(errors.join('\n'))
    }
  }

  render() {
    if (_.isUndefined(this.state.data) || _.isNull(this.state.data)) {
      return <div></div>
    }

    const boolSets = ['Solfege', 'Harmony', 'Inversion']
    let boolEditors = boolSets.map((name, i) => {
      const prop = name.toLowerCase()
      const options = this.state.data.options[prop]
      const changeFn = this.onOptionsChange.bind(this, prop)
      return (
        <BoolOptionsEditor
          key={i}
          options={options}
          name={name}
          onChange={changeFn}
        />
      )
    })

    let audios = _.flatMap(
      this.state.p_set_audios,
      ({ name, audio, id }, i) => {
        const deleteAudio = () => {
          deletePSetAudio(this.state.id, id).then((data) => {
            this.setState(data)
          })
        }

        return [
          <dt key={i * 2}>{name}</dt>,
          <dd key={i * 2 + 1}>
            <ReactAudioPlayer src={audio} controls />
            <button onClick={() => deleteAudio()} className="button alert">
              Delete
            </button>
          </dd>,
        ]
      }
    )

    return (
      <div className="small-12 columns">
        <div className="row large-up-3">
          <fieldset className="column column-block">
            <legend>Name</legend>
            <input
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              name="name"
              type="text"
              value={this.state.name}
              onChange={this.onNameChange}
            />
            <legend>Measures</legend>
            <input
              type="number"
              name="measures"
              className="meter-input"
              value={this.state.data.measures}
              onChange={this.onMeasuresChange}
            />
          </fieldset>
          <fieldset className="column column-block">
            <legend>Meter</legend>
            <input
              type="number"
              name="top"
              className="meter-input"
              value={this.state.data.meter.top}
              onChange={this.onMeterChange}
            />
            /
            <input
              type="number"
              name="bottom"
              className="meter-input"
              value={this.state.data.meter.bottom}
              onChange={this.onMeterChange}
            />
            <legend>Pick-up beat</legend>
            <input
              type="checkbox"
              name="pickUpBeat"
              checked={this.state.data.pickUpBeat}
              onChange={this.onPickUpChange}
            />
          </fieldset>
          <fieldset className="column column-block">
            <legend>Proceed</legend>
            <button
              className="button"
              onClick={this.toRhythmicEntry.bind(this)}
            >
              Proceed to Music Entry
            </button>
          </fieldset>

          {boolEditors}

          <BoolOptionsEditor
            options={this.state.data.options.rhythm}
            name="Rhythm"
            onChange={this.onOptionsChange.bind(this, 'rhythm')}
            formatLabel={durationString}
            labelStyle={{ fontFamily: 'Bravura' }}
          />

          <BoolOptionsEditor
            options={this.state.data.options.key}
            name="Key"
            onChange={this.onOptionsChange.bind(this, 'key')}
            formatLabel={formatKey}
          />

          <StaveOptionsEditor
            measures={this.state.data.measures}
            staves={this.state.data.staves}
            updateStaves={this.onStavesChange}
          />

          <fieldset className="column column-block">
            <legend>Audios</legend>
            <a
              href={`/admin/p_sets/${this.state.id}/audios/new`}
              className="button"
            >
              Add New
            </a>
            <dl>{audios}</dl>
          </fieldset>
        </div>
      </div>
    )
  }
}
