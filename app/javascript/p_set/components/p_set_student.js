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

import A from "../../../assets/audios/A.wav"
import React from "react"
import PropTypes from "prop-types"
import _ from "lodash"
import ReactAudioPlayer from "react-audio-player"

import VexflowComponent from "./vexflow"
import RhythmicEntryComponent from "./rhythmic_entry"
import MelodicEntryComponent from "./melodic_entry"
import HarmonicEntryComponent from "./harmonic_entry"

import {
  newAnswer,
  compareMeterAt,
  compareMeters,
  getAnswerErrors,
  nextNonEmptyMeasure,
  prevNonEmptyMeasure,
  keyOptionToSignature,
  getVFScaleName,
  nextStave,
} from "../lib/utils"
import { fetchPSet, fetchPSetAnswer, updatePSetAnswer } from "../lib/api"
import { type } from "os"

export default class PSetStudentComponent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      rhythmic: true,
      stave: 0,
      currentMeasure: 0,
      currentNote: 0,
      meter: {
        top: 0,
        bottom: 0,
      },
      errors: [],
      posting: false,
      completing: false,
      submitting: false,
    }

    this.changeStave = this.changeStave.bind(this)
    this.handleScoreUpdate = this.handleScoreUpdate.bind(this)
    this.handlePositionUpdate = this.handlePositionUpdate.bind(this)
    this.handleMeterUpdate = this.handleMeterUpdate.bind(this)
    this.handleKeySignatureUpdate = this.handleKeySignatureUpdate.bind(this)
    this.updateCurrentMeasure = this.updateCurrentMeasure.bind(this)
    this.saveAndToggle = this.saveAndToggle.bind(this)
    this.saveAndRender = this.saveAndRender.bind(this)
    this.reportErrors = this.reportErrors.bind(this)
  }

  isRhythmic(props = this.props) {
    return props.location.pathname.match(/\/rhythm\/?$/) !== null
  }

  get rhythmic() {
    return this.isRhythmic()
  }

  get melodic() {
    return this.props.location.pathname.match(/\/melody\/?$/) !== null
  }

  isHarmonic(props = this.props) {
    return props.location.pathname.match(/\/harmony\/?$/) !== null
  }

  get harmonic() {
    return this.isHarmonic()
  }

  get inputMode() {
    return this.rhythmic ? "rhythm" : this.melodic ? "melody" : "harmony"
  }

  getStave(props = this.props) {
    return this.isHarmonic(props)
      ? this.state.vexData.data.staves.length - 1
      : this.state.stave
  }

  get stave() {
    return this.getStave()
  }

  handleScoreUpdate(answer, changeMeasure, changeNote) {
    const newAnswer = _.cloneDeep(this.state.answer)
    const stave = (newAnswer.staves[this.stave] = answer)

    if (this.errorModalEl) {
      try {
        $(this.errorModalEl).foundation("close")
      } catch (e) {}
    }

    const staveErrors = _.cloneDeep(this.state.staveErrors)
    if (
      _.isArray(staveErrors) &&
      !_.isUndefined(staveErrors[this.stave][changeMeasure])
    ) {
      staveErrors[this.stave][changeMeasure].forEach((_, i) => {
        staveErrors[this.stave][changeMeasure][i] = false
      })
    }

    this.setState({ answer: newAnswer, staveErrors })
  }

  saveAndToggle() {
    this.setState({
      rhythmic: !this.state.rhythmic,
    })
  }

  changeStave(e, keyDown) {
    e.preventDefault()
    const stave = this.harmonic
      ? this.state.vexData.data.staves.length - 1
      : keyDown
      ? nextStave(e.key)
      : parseInt(e.target.value)
    const newStaveAnswer = this.state.vexData.data.staves[stave].answer
    const rhythmic = _.every(newStaveAnswer, (a) => _.isEmpty(a.notes))
    let currentMeasure = 0
    if (!this.rhythmic) {
      currentMeasure = nextNonEmptyMeasure(
        newStaveAnswer,
        this.state.currentMeasure
      )
    }
    this.setState({
      stave,
      currentMeasure,
      currentNote: 0,
    })

    if (rhythmic) {
      this.props.history.push("rhythm")
    }
  }

  handlePositionUpdate(pos, increment) {
    if (this.rhythmic) {
      const { currentMeasure } = this.state
      const answer = this.state.answer.staves[this.stave]
      const { meter, pickUpBeat } = this.state.vexData.data
      const meterCheck = compareMeterAt(
        meter,
        answer,
        pickUpBeat,
        currentMeasure
      )
      // if (meterCheck > 0) {
      //   alert('Measure has too few beats! Please go back and correct it.');
      // } else
      if (meterCheck < 0) {
        alert("Measure has too many beats! Please go back and correct it.")
        return
      } else if (meterCheck > 0 && increment) {
        alert("Measure has too few beats! Please go back and correct it.")
        return
      }
    }
    this.setState(pos)
  }

  postAnswer(answer, submission, completed) {
    if (completed) {
      if (!confirm("Submission is final. Are you sure you want to proceed?")) {
        return
      }
    }
    let postingKey = "posting"
    if (completed) {
      postingKey = "completing"
    } else if (submission) {
      postingKey = "submitting"
    }
    this.setState({ [postingKey]: true })
    const { p_set_id } = this.props.match.params
    updatePSetAnswer(p_set_id, answer, submission, completed)
      .then((answer) => {
        this.setState({ answer, [postingKey]: false })
        if (submission) {
          this.reportErrors()
        }
        if (completed) {
          window.location = "/classrooms"
        }
      })
      .catch((e) => {
        console.log("error", e)
        this.setState({ [postingKey]: false })
      })
  }

  handleMeterUpdate(meter) {
    const answer = _.cloneDeep(this.state.answer)
    answer.meter = meter
    if (_.isEqual(meter, this.state.vexData.data.meter)) {
      alert("Correct!")
      this.postAnswer(answer, false)
    } else {
      alert("Incorrect... please try again!")
      this.setState({ answer })
    }
  }

  handleKeySignatureUpdate(keySignature) {
    const stave = this.state.vexData.data.staves[0]
    let key = stave.tonic.pitch
    const answer = _.cloneDeep(this.state.answer)
    if (stave.scale === "minor") {
      key = key.toLowerCase()
    }
    answer.keySignature = keySignature
    if (keySignature === key) {
      setTimeout(() => alert("Correct!"), 0)
      this.postAnswer(answer, false)
    } else {
      setTimeout(() => alert("Incorrect... please try again!"), 0)
      this.setState({ answer })
    }
  }

  updateCurrentMeasure(measure) {
    this.setState({ currentMeasure: measure })
  }

  saveAndRender() {
    alert(
      "Mind our dust! Thanks for completing the exercise. Please leave any feedback in the survey!"
    )
  }

  reportErrors() {
    // marking errors on stave
    let errors = []
    const staveErrors = getAnswerErrors(
      this.state.vexData.data.staves,
      this.state.answer.staves,
      this.inputMode
    )
    const flatErrors = _.chain(staveErrors).flatten().flatten().value()
    const allCorrect = _.every(flatErrors, (e) => e === false)
    if (allCorrect) {
      errors.push("No errors!")
    } else {
      const { meter, staves, pickUpBeat } = this.state.vexData.data
      const solutionMeters = this.state.answer.staves.map((stave) => {
        return compareMeters(meter, stave, pickUpBeat)
      })
      solutionMeters.forEach((stave, i) => {
        const staveName = staves[i].name
        stave.forEach((measure, e) => {
          if (measure > 0) {
            errors.push(`Measure ${e + 1} in ${staveName} has too few beats`)
          } else if (measure < 0) {
            errors.push(`Measure ${e + 1} in ${staveName} has too many beats`)
          }
        })
      })
    }

    this.setState({ staveErrors, errors })
  }

  componentWillReceiveProps(props) {
    if (!this.isRhythmic(props)) {
      const { staves } = this.state.answer
      let { currentMeasure } = this.state
      const answer = staves[this.getStave(props)]
      currentMeasure = nextNonEmptyMeasure(answer, currentMeasure)
      this.setState({ currentMeasure })
    }
  }

  componentDidMount() {
    const { p_set_id } = this.props.match.params
    const pSetPromise = fetchPSet(p_set_id).then((pSet) => {
      const stave = this.harmonic ? pSet.data.staves.length - 1 : 0
      return { vexData: pSet, stave }
    })
    const answerPromise = fetchPSetAnswer(p_set_id)
    Promise.all([pSetPromise, answerPromise]).then(([state, answer]) => {
      if (_.isEmpty(answer)) {
        answer = newAnswer(state.vexData)
      }
      state.currentMeasure = 0
      if (!this.rhythmic) {
        state.currentMeasure = nextNonEmptyMeasure(answer.staves[state.stave])
      }
      this.setState(Object.assign(state, { answer }, { meter: answer.meter }))
    })

    if (!_.isUndefined(this.containerEl)) {
      $(this.containerEl).foundation()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isUndefined(this.errorModalEl) && this.showError) {
      const $error = $(this.errorModalEl)
      $error.foundation()
      this.showError = false
      $error.foundation("open")
    }

    if (!_.isUndefined(this.containerEl)) {
      $(this.containerEl).foundation()
    }
  }

  render() {
    if (_.isUndefined(this.state.vexData)) {
      return <div></div>
    }

    const vexData = this.state.vexData.data
    const stave = vexData.staves[this.stave]
    const answer = this.state.answer.staves[this.stave]

    const staveOptions = vexData.staves.map((s, i) => {
      return (
        <option key={i} value={i}>
          {s.name}
        </option>
      )
    })

    let renderMode = VexflowComponent.RenderMode.RHYTHMIC

    let entryComponent = null
    let audios = _.flatMap(
      this.state.vexData.p_set_audios,
      ({ name, audio }, i) => {
        return [
          <dt key={i * 2}>{name}</dt>,
          <dd key={i * 2 + 1}>
            <ReactAudioPlayer src={audio} controls />
          </dd>,
        ]
      }
    )

    if (this.rhythmic) {
      entryComponent = (
        <RhythmicEntryComponent
          errors={this.state.errors}
          options={vexData.options}
          referenceMeter={vexData.meter}
          stave={stave}
          measures={answer}
          staveId={this.stave}
          meter={this.state.answer.meter}
          updateStave={this.handleScoreUpdate}
          changeStave={this.changeStave}
          updatePosition={this.handlePositionUpdate}
          updateMeter={this.handleMeterUpdate}
          currentMeasure={this.state.currentMeasure}
          instructor={false}
          save={this.saveAndToggle}
        />
      )
    } else if (this.melodic) {
      renderMode = VexflowComponent.RenderMode.MELODIC
      entryComponent = (
        <MelodicEntryComponent
          errors={this.state.errors}
          options={vexData.options}
          keySignature={this.state.answer.keySignature}
          stave={stave}
          measures={answer}
          staveId={this.stave}
          updateStave={this.handleScoreUpdate}
          changeStave={this.changeStave}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          updateKeySignature={this.handleKeySignatureUpdate}
          save={this.saveAndToggle}
          instructor={false}
        />
      )
    } else {
      renderMode = VexflowComponent.RenderMode.HARMONIC
      entryComponent = (
        <HarmonicEntryComponent
          errors={this.state.errors}
          options={vexData.options}
          stave={vexData.staves[this.stave]}
          staveId={this.stave}
          updateStave={this.handleScoreUpdate}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          save={this.saveAndToggle}
          instructor={false}
        />
      )
    }

    const mode = this.rhythmic ? "rhythm" : "melody"
    const errors = this.state.errors.map((e, i) => {
      return <li key={i}>{e}</li>
    })

    const vfStaves = _.zipWith(
      vexData.staves,
      this.state.answer.staves,
      (s, a) => {
        return Object.assign(s, { answer: a })
      }
    )

    let meter = this.state.answer.meter
    if (!_.isEqual(meter, vexData.meter)) {
      meter = {}
    }
    let keySignature = keyOptionToSignature(this.state.answer.keySignature)
    if (keySignature !== getVFScaleName(stave.tonic, stave.scale)) {
      keySignature = null
    }

    const showIf = (cond) => {
      return cond ? {} : { display: "none" }
    }

    return (
      <div className="small-12 columns" ref={(el) => (this.containerEl = el)}>
        <div
          className="reveal"
          data-reveal
          id="error-modal"
          ref={(el) => (this.errorModalEl = el)}
        >
          <h4>Errors</h4>
          <ul>{errors}</ul>
        </div>
        <div className="row">
          <div className="small-10 columns">
            <h3>
              {this.state.vexData.name}:{" "}
              {this.rhythmic
                ? "Rhythmic"
                : this.melodic
                ? "Melodic"
                : "Harmonic"}{" "}
              Entry
            </h3>
          </div>
          <div className="small-2 columns">
            <fieldset>
              <legend>Audio Samples</legend>
              <dl>{audios}</dl>
            </fieldset>
          </div>
        </div>
        <div className="row">
          <div className="small-10 columns">
            <VexflowComponent
              staves={vfStaves}
              editing={this.stave}
              meter={meter}
              render="answer"
              mode={renderMode}
              keySignature={keySignature}
              currentMeasure={this.state.currentMeasure}
              measures={this.state.vexData.data.measures}
              staveErrors={this.state.staveErrors}
              currentNote={this.state.currentNote}
            />
            <div style={showIf(!_.isEmpty(this.state.errors))}>
              <ul>{errors}</ul>
            </div>
          </div>
          <div className="small-2 columns">
            <div className="row columns">
              <fieldset>
                <legend>Stave</legend>
                <select
                  value={this.stave}
                  disabled={this.harmonic}
                  onChange={this.changeStave.bind(this)}
                >
                  {staveOptions}
                </select>
              </fieldset>
              <p>
                <button
                  className="button"
                  onClick={() =>
                    this.postAnswer(this.state.answer, false, false)
                  }
                >
                  {this.state.posting ? "Saving..." : "Save"}
                </button>
              </p>
              <p>
                <button
                  className="button"
                  onClick={() =>
                    this.postAnswer(this.state.answer, true, false)
                  }
                >
                  {this.state.submitting ? "Submitting..." : "Check Answer"}
                </button>
              </p>
              <p>
                <button
                  className="button"
                  onClick={() => this.postAnswer(this.state.answer, true, true)}
                >
                  {this.state.completing ? "Submitting..." : "Complete PSet"}
                </button>
              </p>
            </div>
            <audio src={A}></audio>
            {entryComponent}
          </div>
        </div>
      </div>
    )
  }
}
