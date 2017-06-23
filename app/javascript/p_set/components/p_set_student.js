import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import VexflowComponent from './vexflow';
import RhythmicEntryComponent from './rhythmic_entry';
import MelodicEntryComponent from './melodic_entry';

let trebleScore = 'do-mi-mi-mi-mi-fa-so-la-ti-do-fi-la-so-re-fa-fa-fa-fa-so-la-so-fa-mi-fa-re-do-re-ti-re-do';
trebleScore = trebleScore.split('-').map((note) => {
  return {type: 'note', solfege: note, octave: 0, dots: 0};
});
let trebleDurations = [[8, 8, 8, 8], ['8', 16, 4], [8, 8, 8, 8], [4, 4],
                       [8, 8, 8, 8], [16, 16, 16, 16, 4], [8, 16, 16, 8, 16, 16],
                       [4, 4]];
let treble = trebleDurations.map((measure, i, arr) => {
  return {
    endBar: i === (arr.length - 1) ? 'end' : 'single',
    notes: measure.map((duration) => {
      const note = trebleScore.shift();
      if (_.isNumber(duration)) {
        note.duration = duration.toString();
        note.dots = 0;
      } else {
        note.duration = duration;
        note.dots = 1;
      }
      return note;
    })
  };
});
let bassScore = 'do-do-ti-la-so-so-so-do-so-so-do';
bassScore = bassScore.split('-').map((note, i) => {
  return {type: 'note', solfege: note, octave: 0 /* 2 */};
});
let bassDurations = [[2], [4, 4], [2], [2], [2], [2], [4, 4], [4, 4]];
let bass = bassDurations.map((measure, i, arr) => {
  return {
    endBar: i === (arr.length - 1) ? 'end' : 'single',
    notes: measure.map((duration) => {
      const note = bassScore.shift();
      if (_.isNumber(duration)) {
        note.duration = duration.toString();
        note.dots = 0;
      } else {
        note.duration = duration;
        note.dots = 1;
      }
      return note;
    })
  };
});
[[0, 0], [1, 0], [6, 0], [7, 1]].forEach(([x, y]) => {
  bass[x].notes[y].octave = 1;
});
treble[2].notes[2].octave = 1;
treble[6].notes[5].octave = -1;

const pSetData = {
  options: {
    rhythm: [
      ['16', true], ['8', true], ['4', true], ['2', true], ['1', true]
    ],
    solfege: [
      ['ti', true], ['la', true], ['so', true], ['fi', true], ['fa', true],
      ['mi', true], ['re', true], ['do', true]
    ],
    keys: ['E', 'F', 'G'],
    key: 'F'
  },
  staves: [
    {
      clef: 'treble',
      name: 'Lead',
      tonic: 'f4',
      scale: 'major',
      solution: treble,
      answer: [
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'end', notes: []},
      ],
      audios: {
        rhythm: [
          {
            name: 'Melodic Rhythm',
            url: 'https://s3.amazonaws.com/tuna-music-dication/Demo+Dictation+Melodic+Rhythm.mp3'
          },
        ],
        melody: [
          {
            name: 'Melodic Line',
            url: 'https://s3.amazonaws.com/tuna-music-dication/Demo+Dictation+Melodic+Line.mp3'
          },
        ]
      }
    },
    {
      clef: 'bass',
      name: 'Bass',
      tonic: 'f2',
      scale: 'major',
      solution: bass,
      answer: [
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'single', notes: []},
        {endBar: 'end', notes: []},
      ],
      audios: {
        rhythm: [
          {
            name: 'Bass Rhythm',
            url: 'https://s3.amazonaws.com/tuna-music-dication/Demo+Dictation+Bass+Rhythm.mp3'
          },
        ],
        melody: [
          {
            name: 'Bass Line',
            url: 'https://s3.amazonaws.com/tuna-music-dication/Demo+Dictation+Bass+Line.mp3'
          },
        ]
      }
    }
  ],
  meter: {top: 2, bottom: 4},
  measures: 10,
};

export default class PSetStudentComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vexData: pSetData,
      rhythmic: true,
      stave: 0,
      currentMeasure: 0,
      currentNote: 0,
      meter: {
        top: 0, bottom: 0
      },
      keySignature: '',
      errors: []
    };

    this.handleScoreUpdate = this.handleScoreUpdate.bind(this);
    this.handlePositionUpdate = this.handlePositionUpdate.bind(this);
    this.handleMeterUpdate = this.handleMeterUpdate.bind(this);
    this.handleKeySignatureUpdate = this.handleKeySignatureUpdate.bind(this);
    this.updateCurrentMeasure = this.updateCurrentMeasure.bind(this);
    this.saveAndToggle = this.saveAndToggle.bind(this);
    this.saveAndRender = this.saveAndRender.bind(this);
    this.reportErrors = this.reportErrors.bind(this);

    this.showError = false;
  }

  handleScoreUpdate(answer, changeMeasure, changeNote) {
    const newVexData = _.cloneDeep(this.state.vexData);
    const stave = newVexData.staves[this.state.stave];
    Object.assign(stave, {answer});

    if (this.errorModalEl) {
      try {
        $(this.errorModalEl).foundation('close');
      } catch (e) {
      }
    }

    const staveErrors = _.cloneDeep(this.state.staveErrors);
    if (_.isArray(staveErrors)) {
      staveErrors[changeMeasure][changeNote] = false;
    }

    this.setState({
      vexData: newVexData,
      staveErrors
    });
  }

  saveAndToggle() {
    this.setState({
      rhythmic: !this.state.rhythmic
    });
  }

  changeStave(e) {
    e.preventDefault();
    const stave = parseInt(e.target.value);
    this.setState({
      stave,
      rhythmic: true,
      currentNote: 0,
      currentMeasure: 0,
      staveErrors: undefined
    });
  }

  handlePositionUpdate(pos) {
    this.setState(pos);
  }
  
  handleMeterUpdate(meter) {
    if (_.isEqual(meter, this.state.vexData.meter)) {
      alert('Correct!');
    } else {
      alert('Incorrect... please try again!');
    }
    this.setState({meter});
  }

  handleKeySignatureUpdate(keySignature) {
    if (keySignature === this.state.vexData.options.key) {
      alert('Correct!');
    } else {
      alert('Incorrect... please try again!');
    }
    this.setState({keySignature});
  }

  updateCurrentMeasure(measure) {
    this.setState({currentMeasure: measure});
  }

  saveAndRender() {
    alert('Mind our dust! Thanks for completing the exercise. Please leave any feedback in the survey!');
  }

  getErrors(rhythmic) {
    const stave = this.state.vexData.staves[this.state.stave];
    const { answer, solution } = stave;

    return _.zipWith(answer, solution, (m1, m2) => {
      return _.zipWith(m1.notes, m2.notes, (n1, n2) => {
        if (_.isUndefined(n1)) {
          return false;
        }

        if (_.isUndefined(n2)) {
          return true;
        }

        if (rhythmic) {
          return n1.duration !== n2.duration ||
            n1.dots !== n2.dots;
        } else {
          return !_.isEqual(n1, n2);
        }
      });
    });
  }

  reportErrors(errors) {
    if (!_.isUndefined(errors)) {
      // reporting an error modal
      this.showError = true;
      this.setState({errors});
    } else {
      // marking errors on stave
      errors = [];
      const staveErrors = this.getErrors(this.state.rhythmic);
      if (_.every(staveErrors, (es) => _.every(es, (e) => !e))) {
        this.showError = true;
        errors.push('No errors!');
      }
      this.setState({staveErrors, errors});
    }
  }

  componentDidMount() {
    if (!_.isUndefined(this.containerEl)) {
      $(this.containerEl).foundation();
    }
  }

  componentDidUpdate() {
    if (!_.isUndefined(this.errorModalEl) && this.showError) {
      const $error = $(this.errorModalEl);
      $error.foundation();
      this.showError = false;
      $error.foundation('open');
    }

    if (!_.isUndefined(this.containerEl)) {
      $(this.containerEl).foundation();
    }
  }

  render() {
    const { vexData } = this.state;
    const stave = vexData.staves[this.state.stave];

    const staveOptions = vexData.staves.map((s, i) => {
      return (
        <option key={i} value={i}>{_.capitalize(s.clef)} ({s.name})</option>
      );
    });

    let renderMode = VexflowComponent.RenderMode.RHYTHMIC;

    let entryComponent = null;
    if (this.state.rhythmic) {
      entryComponent = (
        <RhythmicEntryComponent options={vexData.options}
          referenceMeter={vexData.meter}
          stave={vexData.staves[this.state.stave]}
          meter={this.state.meter}
          updateStave={this.handleScoreUpdate}
          updatePosition={this.handlePositionUpdate}
          updateMeter={this.handleMeterUpdate}
          currentMeasure={this.state.currentMeasure}
          reportErrors={this.reportErrors}
          save={this.saveAndToggle} />
      );
    } else {
      renderMode = VexflowComponent.RenderMode.MELODIC;
      entryComponent = (
        <MelodicEntryComponent options={vexData.options}
          keySignature={this.state.keySignature}
          stave={vexData.staves[this.state.stave]}
          updateStave={this.handleScoreUpdate}
          currentMeasure={this.state.currentMeasure}
          currentNote={this.state.currentNote}
          updatePosition={this.handlePositionUpdate}
          updateKeySignature={this.handleKeySignatureUpdate}
          reportErrors={this.reportErrors}
          save={this.saveAndToggle}
          complete={this.saveAndRender} />
      );
    }

    const startMeasure = Math.floor(this.state.currentMeasure / 4) * 4;
    const mode = this.state.rhythmic ? 'rhythm' : 'melody';
    const audios = stave.audios[mode].map(({name, url}, i) => {
      return (
        <li key={i}>
          <p>{name}</p>
          <audio controls>
            <source src={url} type="audio/mpeg" />
            Your browser does not support HTML5 audio.
          </audio>
        </li>
      );
    });

    const errors = this.state.errors.map((e, i) => {
      return (
        <li key={i}>{e}</li>
      );
    });

    return (
      <div className="small-12" ref={(el) => this.containerEl = el}>
        <div className="reveal"
             data-reveal
             id="error-modal"
             ref={(el) => this.errorModalEl = el}>
          <h4>Errors</h4>
          <ul>{errors}</ul>
        </div>
        <div className="reveal"
             data-reveal
             id="audios-modal">
          <h4>Audio</h4>
          <ul>{audios}</ul>
        </div>
        <div className="row">
          <div className="small-12 large-10 small-centered">
            <h3>Demo Dication: {this.state.rhythmic ? 'Rhythmic' : 'Melodic'} Entry</h3>
            <div className="row">
              <div className="small-10 columns">
                <VexflowComponent staves={vexData.staves}
                                  editing={this.state.stave}
                                  meter={this.state.meter}
                                  mode={renderMode}
                                  keySignature={this.state.keySignature}
                                  currentMeasure={this.state.currentMeasure}
                                  startMeasure={startMeasure}
                                  staveErrors={this.state.staveErrors}
                                  currentNote={this.state.currentNote} />
              </div>
              <div className="small-2 columns">
                <div className="row columns">
                  <fieldset>
                    <legend>Stave</legend>
                    <select value={this.state.stave}
                            onChange={this.changeStave.bind(this)}>
                      {staveOptions}
                    </select>
                  </fieldset>
                </div>
                {entryComponent}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
