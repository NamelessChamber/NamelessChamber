import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Vex from 'vexflow'
import teoria from 'teoria'
import _ from 'lodash'
import { currentPage, getVFScaleName, tonicStr } from '../lib/utils'

const VF = Vex.Flow

// lifted from teoria... sadly not exposed
const intervalSolfege = {
  dd1: 'daw',
  d1: 'de',
  P1: 'do',
  A1: 'di',
  AA1: 'dai',
  d2: 'raw',
  m2: 'ra',
  M2: 're',
  A2: 'ri',
  AA2: 'rai',
  d3: 'maw',
  m3: 'me',
  M3: 'mi',
  A3: 'mai',
  dd4: 'faw',
  d4: 'fe',
  P4: 'fa',
  A4: 'fi',
  AA4: 'fai',
  dd5: 'saw',
  d5: 'se',
  P5: 'sol',
  A5: 'si',
  AA5: 'sai',
  d6: 'law',
  m6: 'le',
  M6: 'la',
  A6: 'li',
  AA6: 'lai',
  d7: 'taw',
  m7: 'te',
  M7: 'ti',
  A7: 'tai',
  // 'dd8': 'daw',
  // 'd8': 'de',
  // 'P8': 'do',
  // 'A8': 'di',
  // 'AA8': 'dai'
}

// The minor key starts three semitones below its relative major
function minorToMajor(tonic) {
  return tonic.interval('m3')
}

const solfegeInterval = _.invert(intervalSolfege)

const noteEq = (n1, n2) => {
  return _.isEqual(n1.coord, n2.coord)
}

// equates notes regardless of the octave they're in
// i.e. tNote of G4 and tNote G5 are 'relatively equivalent'
// i.e. noteRelEq would return true
const noteRelEq = (n1, n2) => {
  const [n1o, n1f] = n1.coord
  const [n2o, n2f] = n2.coord
  const semisDiff = (n1o - n2o) * 12 + (n1f - n2f) * 7
  return semisDiff % 12 == 0
}

const getNote = (tonic, octave, solfege, minor) => {
  const interval = solfegeInterval[solfege]
  let note = teoria.note(tonicStr(tonic))

  if (minor) {
    note = minorToMajor(note)
  }

  note.coord[0] += octave
  return note.interval(interval)
}

const getAccidentalToRender = ({ scale, measureTNotes, noteIndex, score }) => {
  /*
    for each note:
      example:

      * we are in a key in which F is sharp i.e. F# is IN the scale *

      nF #F F F
      3rd and 4th F do not have an accidental because the 2nd F
      had already the accidental

      the 'octave rule':
      nF #F4 bF5 F4
      the last F4 has no accidental due to the preceeding bF5,
      because bF5 is not in the same octave as F4, hence F4
      is affected by the #F4

      some more example:

      G G G F

      G #G G nG

      in the key of D where #F #C
      #D D nD D

      // TODO/FIXME -- would not work with rules below (but maybe it's ok)
      nF5 F4 #F5 F5
      

      // TODO: convert rules below to code
      // TODO: add tests that validate all of our thinking
      // TODO MAYBE: figure out octave rule that works ((maybe not necessary))


      previousInstanceOfSameLetterIsSamePitch = (
        the previous instance of the same letter name in that octave is the same pitch
        (i.e. piano key i.e. same midi note number i.e. same frequency)
      )

      if
          in the scale:
        AND
          (
          there is no instance of that same letter name earlier in the measure
            OR
          previousInstanceOfSameLetterIsSamePitch
          )
        THEN
          NO accidental
      else:
        // NOT in the scale
        if (previousInstanceOfSameLetterIsSamePitch)
          NO accidental
        else 
          accidental
          

  */


  const note = measureTNotes[noteIndex];

  const isInScale = !_.isUndefined(
    _.find(scale.notes(), _.bind(noteRelEq, this, note))
  )


  let isPreviousInstanceOfSameLetterIsSamePitch = false;
  let indexOfPreviousInstance = null;
  for (let i = 0; i < noteIndex; i++) {
    // measureTNotes[i] will be null for rests
    // rests are not converted in convertNote to tNotes
    // and (obviously) should not be taken into account in the accidentals math
    if(measureTNotes[i] === null) {
      continue;
    }

    if (measureTNotes[i].name() === note.name()) {
      indexOfPreviousInstance = i;
    }
  }
  if (indexOfPreviousInstance !== null && measureTNotes[indexOfPreviousInstance].key() === note.key()) {
    isPreviousInstanceOfSameLetterIsSamePitch = true;
  }


  let noPriorInstanceOfLetterName = true;
  for (let i = 0; i < noteIndex; i++) {
    // as above for the indexOfPreviousInstance check,
    // measureTNotes[i] will be null for rests
    // ignore these.
    if(measureTNotes[i] === null) {
      continue;
    }

    if (measureTNotes[i].name() === note.name()) {
      noPriorInstanceOfLetterName = false
    }
  }


  if (isInScale && (noPriorInstanceOfLetterName || isPreviousInstanceOfSameLetterIsSamePitch)) {
    return null;
  } else if (isPreviousInstanceOfSameLetterIsSamePitch) {
    return null;
  } else {
    const accidental = note.accidental()
    if (accidental === '') {
      return 'n'
    } else {
      return accidental;
    }
  }
}

const staveComplete = (stave, render) => {
  return _.every(stave[render], (measure) => {
    return _.every(measure.notes, (note) => {
      return (
        _.endsWith(note.duration, 'r') ||
        (!_.isUndefined(note.solfege) && !_.isUndefined(note.octave))
      )
    })
  })
}

const STAVE_HEIGHT = 125
const RENDER_MODES = {
  RHYTHMIC: 0,
  MELODIC: 1,
  STANDARD: 2,
  HARMONIC: 3,
}

export default class VexflowComponent extends React.Component {
  constructor(props) {
    super(props)

    this.renderer = null
    this.updateDimensions = this.updateDimensions.bind(this)
    this.updateDimensionsDebounced = _.debounce(this.updateDimensions, 250)
  }

  updateDimensions() {
    if (_.isUndefined(this.vexflowEl)) {
      return
    }

    this.vexflowEl.innerHTML = null

    const e = ReactDOM.findDOMNode(this.vexflowEl)
    const containerWidth = e.offsetWidth
    this.containerWidth = containerWidth

    this.renderer = new VF.Renderer(e, VF.Renderer.Backends.SVG)
    const height = STAVE_HEIGHT * this.props.staves.length + 50
    this.renderer.resize(containerWidth, height)

    this.redrawVexflow(this.props)
  }

  static propTypes = {
    staves: PropTypes.array.isRequired,
    render: PropTypes.string.isRequired,
    meter: PropTypes.object.isRequired,
    mode: PropTypes.number.isRequired,
    editing: PropTypes.number,
    keySignature: PropTypes.string,
    currentMeasure: PropTypes.number,
    currentNote: PropTypes.number,
    measures: PropTypes.number.isRequired,
    staveErrors: PropTypes.array,
  }

  static RenderMode = RENDER_MODES

  static defaultProps = {
    mode: VexflowComponent.RenderMode.MELODIC,
  }

  meterToString(props) {
    if (props.meter.top && props.meter.bottom) {
      return `${props.meter.top}/${props.meter.bottom}`
    }
  }

  defaultLineForStave(clef) {
    if (clef === 'treble') {
      return ['b/4']
    } else if (clef === 'bass') {
      return ['d/3']
    } else if (clef === 'alto') {
      return ['c/4']
    } else if (clef === 'tenor') {
      return ['a/3']
    } else {
      return ['c/4']
    }
  }

  getMeasureTNote({ stave, note }) {
    const { solfege, octave } = note

    if (_.isUndefined(solfege) || _.isUndefined(octave)) {
      return null;
    }

    return getNote(
      stave.tonic,
      octave,
      solfege,
      stave.scale === 'minor'
    )
  }

  convertNote(props, error, highlight, editing, stave, renderMode, note, i, score, measureTNotes) {
    const { type, harmony, inversion } = note
    const { mode } = props

    const { solfege, octave, duration } = note

    let keys = this.defaultLineForStave(stave.clef)
    let accidental = null
    if (
      renderMode === RENDER_MODES.MELODIC &&
      !_.isUndefined(solfege) &&
      !_.isUndefined(octave)
    ) {
      const scale = teoria.scale(tonicStr(stave.tonic), stave.scale);

      accidental = getAccidentalToRender({ scale, measureTNotes, noteIndex: i, score });

      const tNote = measureTNotes[i];
      keys = [`${tNote.name()}/${tNote.octave()}`]
    }

    // Stave notes dont support tuplets
    // Instructor should not include triplets in psets yet
    let staveNote = new VF.StaveNote({
      // 'duration' will be '8' for an eigth note and '8r' for an eigth rest
      duration: duration,
      // 'keys' is the actual note(s) e.g., 'd/4' as the D of the 4th octave
      // it's an array since it could have more than one 'note head' if this was a chord
      // see https://github.com/0xfe/vexflow/wiki/The-VexFlow-Tutorial
      keys: keys,
      clef: stave.clef,
    })

    // NOTE: in the future, let's account for multiple 'keys' on the note
    if (error) {
      staveNote.setKeyStyle(0, {
        shadowBlur: 15,
        shadowColor: 'red',
        fillStyle: 'red',
      })
    } else if (
      renderMode === RENDER_MODES.MELODIC &&
      (_.isUndefined(solfege) || _.isUndefined(octave)) &&
      editing &&
      !duration.endsWith('r')
    ) {
      staveNote.setKeyStyle(0, {
        shadowBlur: 15,
        shadowColor: 'blue',
        fillStyle: 'blue',
      })
    }

    if (_.isString(harmony) && renderMode === RENDER_MODES.MELODIC) {
      let annStr = harmony
      if (_.isString(inversion)) {
        annStr = `${annStr} ${inversion}`
      }
      const annotation = new VF.Annotation(annStr).setVerticalJustification(
        VF.Annotation.VerticalJustify.BOTTOM
      )
      staveNote.addModifier(0, annotation)
    }

    if (
      highlight &&
      _.isNumber(props.currentNote) &&
      renderMode === RENDER_MODES.MELODIC
    ) {
      if (i === props.currentNote) {
        const annotation = new VF.Annotation('▲').setVerticalJustification(
          VF.Annotation.VerticalJustify.BOTTOM
        )
        staveNote.addModifier(0, annotation)
      }
    }

    if (!_.isUndefined(note.dots) && note.dots > 0) {
      _.times(note.dots, () => staveNote.addDotToAll())
    }

    if (!_.isNull(accidental)) {
      staveNote.addAccidental(0, new VF.Accidental(accidental))
    }

    return staveNote
  }

  scoreToVoice(
    props,
    measureIndex,
    staveIndex,
    score,
    width,
    highlight,
    editing,
    stave,
    renderMode
  ) {
    const context = this.renderer.getContext()

    const voiceOpts =
      props.meter.top && props.meter.bottom
        ? { num_beats: props.meter.top, beat_value: props.meter.bottom }
        : {}
    const voice = new VF.Voice(voiceOpts)
    voice.setMode(VF.Voice.Mode.SOFT)

    let notes = []

    const convertedTNotes = score.map((note) => this.getMeasureTNote({
      stave,
      note
    }));

    notes = score.map((n, i) => {
      let error = false;
      if (!_.isUndefined(props.staveErrors)) {
        error = props.staveErrors[staveIndex][measureIndex][i]
      }
      return this.convertNote(
        props,
        error,
        highlight,
        editing,
        stave,
        renderMode,
        n,
        i,
        score,
        convertedTNotes
      )
    })

    const beams = VF.Beam.generateBeams(notes)
    voice.addTickables(notes)
    const formatter = new VF.Formatter()
      .joinVoices([voice])
      .format([voice], width)

    return [voice, beams, notes]
  }

  redrawVexflow(props) {
    const context = this.renderer.getContext()
    context.clear()

    function getWidthOfMeasureNotes(score) {
      return score.reduce((acc, item) => {
        if (item.type === 'note') {

          return acc + 1 + (item.dots || 0) * 0.2
        } else if (item.type === 'beam') {
          return acc + getWidthOfMeasureNotes(item.notes)
        }
      }, 0)
    }

    this.staves = []
    let lastStave = null
    let yOffset = 25
    const firstStaves = []
    const formatter = new VF.Formatter()
    const currentMeasure = props.currentMeasure == -1 ? 0 : props.currentMeasure
    const page = currentPage(
      this.containerWidth,
      props.render,
      props.staves,
      currentMeasure
    )

    const startMeasure = _.first(page)
    const numMeasures = page.length
    const firstStave = props.staves[0]
    const lastMeasure = Math.min(props.measures, startMeasure + numMeasures)
    // FIXME remove! as width is calculated automatically
    const measureWidths = _.range(startMeasure, lastMeasure).map((i) => {
      return props.staves.reduce((m, x) => {
        const measure = x[props.render][i]
        const measureLength = getWidthOfMeasureNotes(measure.notes)
        return Math.max(m, measureLength)
      }, 0)
    })

    const staves =
      props.mode === RENDER_MODES.HARMONIC
        ? _.slice(props.staves, props.staves.length - 1)
        : props.staves

    staves.forEach((stave, e) => {
      let editing = e === props.editing
      let widthOffset = 5

      let renderMode = props.mode
      if (renderMode === RENDER_MODES.HARMONIC) {
        renderMode = RENDER_MODES.MELODIC
        editing = true
        e = props.staves.length - 1
      } else if (!editing && staveComplete(stave, props.render)) {
        renderMode = RENDER_MODES.MELODIC
      }

      const scoreSlice = _.slice(
        stave[this.props.render],
        startMeasure,
        lastMeasure
      )

      let allVFNotes = []
      let allNotes = []

      scoreSlice.forEach((score, i) => {
        const index = i + startMeasure

        const { notes } = score
        allNotes = allNotes.concat(notes)

        let width = measureWidths[i] * 45

        if (width === 0) {
          width = 70
        }

        let offsetIncrement = width

        if (index === 0) {
          // clef
          offsetIncrement += 115
        }

        const staveObj = new VF.Stave(widthOffset, yOffset, offsetIncrement)
        // const staveObj = new VF.Stave(0, 0, 1000)
        staveObj.setContext(context)

        if (score.endBar) {
          staveObj.setEndBarType(VF.Barline.type[score.endBar.toUpperCase()])
        }

        staveObj.setMeasure(index + 1)
        let highlight = false
        if (index === props.currentMeasure && editing) {
          highlight = true
          if (props.mode === RENDER_MODES.RHYTHMIC) {
            staveObj.setSection('▼', 0)
          }
        }

        const meter = this.meterToString(props)
        if (index === 0 && _.isString(meter)) {
          staveObj.addClef(stave.clef).addTimeSignature(meter)
          if (!(_.isUndefined(stave.tonic) || _.isUndefined(stave.scale))) {
            if (_.isString(props.keySignature) && props.keySignature !== '') {
              staveObj.addKeySignature(props.keySignature)
            } else if (!_.isNull(props.keySignature)) {
              const keySignature = getVFScaleName(stave.tonic, stave.scale)
              staveObj.addKeySignature(keySignature)
            }
          }
        }

        // we would prefer to draw the stave first,
        // and then to draw the notes (i.e. the voice),
        // however, to call getBoundingBox on the voice,
        // the voice needs to be drawn...
        // however, if we draw the voice first and the stave second,
        // the stave appears to be on top of the notes...
        // hacky solution for now:
        // draw the voice (to measure it),
        // then the stave, then the voice again so that it appears on top
        // of the stave.

        const [voice, beams, vfNotes] = this.scoreToVoice(
          props,
          index,
          e,
          notes,
          width,
          highlight,
          editing,
          stave,
          renderMode
        )
        voice.draw(context, staveObj)

        let actualMeasureWidth = voice.getBoundingBox()['w'] + 22;

        if(index === 0) {
          // TODO -- best case: measure clef + possible key signature + time signature width
          // alternatively: have hardcoded value when key signature present and another value when no key signature
          actualMeasureWidth += 90;
        }

        staveObj.setWidth(actualMeasureWidth);
        staveObj.draw()

        // TODO this is a hack to make sure that the notes do appear on top of
        // the stave. in an ideal world, we would not have to do this.
        voice.draw(context, staveObj)

        beams.forEach((b) => b.setContext(context).draw())
        allVFNotes = allVFNotes.concat(vfNotes)

        widthOffset += actualMeasureWidth;
        this.staves.push(staveObj)

        if (index === 0) {
          firstStaves.push(staveObj)
        }
      })
      _.zip(allNotes, _.tail(allNotes), allVFNotes, _.tail(allVFNotes))
        .filter(([n1, n2, ,]) => !_.isUndefined(n2) && n1.tied)
        .forEach(([, , n1, n2]) => {
          const tie = new VF.StaveTie({
            first_note: n1,
            last_note: n2,
            first_indices: [0],
            last_indices: [0],
          })
          tie.setContext(context)
          tie.draw()
        })
      yOffset += STAVE_HEIGHT
    })

    const stavePairs = firstStaves.reduce(
      ([res, last], x) => {
        if (!_.isUndefined(last)) {
          res.push([last, x])
        }
        return [res, x]
      },
      [[]]
    )
    this.connectors = stavePairs[0].map(([s1, s2]) => {
      if (_.isUndefined(s2)) {
        return
      }
      const conn = new VF.StaveConnector(s1, s2)
      conn.setType(VF.StaveConnector.type.SINGLE_LEFT)
      conn.setContext(context)
      conn.draw()

      return conn
    })
  }

  shouldComponentUpdate() {
    return true
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.redrawVexflow(newProps)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensionsDebounced)
  }

  componentDidMount() {
    const e = ReactDOM.findDOMNode(this.vexflowEl)
    const containerWidth = e.offsetWidth
    this.containerWidth = containerWidth

    window.addEventListener('resize', this.updateDimensionsDebounced)
    this.updateDimensions()
  }

  render() {
    const style = {
      width: '100%',
    }

    return <div ref={(el) => (this.vexflowEl = el)} style={style}></div>
  }
}
