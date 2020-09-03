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





import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import ReactAudioPlayer from 'react-audio-player';

import VexflowComponent from './vexflow';
import { formatKey, nextNonEmptyMeasure, prevNonEmptyMeasure, keyOptionToSignature, getVFScaleName, changeAudioPlayerState, playA, clickSave } from '../lib/utils';

const diatonics = 
{
  'do': 'd',
  're': 'r',
  'mi': 'm',
  'fa': 'f',
  'sol': 's',
  'la': 'l',
  'ti': 't'
}

const clefToOctave = (clef) => {
  if (clef === 'treble') {
    return 4;
  } else if (clef === 'bass') {
    return 3;
  }
};

const staveComplete = (stave) => {
  return _.every(stave.answer, (measure) => {
    return _.every(measure.notes, (note) => {
      return _.endsWith(note.duration, 'r') ||
        (!_.isUndefined(note.solfege) && !_.isUndefined(note.octave));
    });
  });
};

export default class MelodicEntryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      octave: 0,
      keySignature: props.keySignature
    };

    this.updateKey = this.updateKey.bind(this);
  }

  static propTypes = {
    errors: PropTypes.array.isRequired,
    options: PropTypes.object.isRequired,
    stave: PropTypes.object.isRequired,
    measures: PropTypes.array.isRequired,
    staveId: PropTypes.number.isRequired,
    keySignature: PropTypes.string,
    updateStave: PropTypes.func.isRequired,
    changeStave: PropTypes.func.isRequired,
    updatePosition: PropTypes.func.isRequired,
    updateKeySignature: PropTypes.func.isRequired,
    currentMeasure: PropTypes.number.isRequired,
    currentNote: PropTypes.number.isRequired,
    save: PropTypes.func.isRequired,
    instructor: PropTypes.bool
  }

  static defaultProps = {
    instructor: true
  }

  getMeasures(props = this.props) {
    return props.measures;
  }

  get measures() {
    return this.getMeasures();
  }

  setCurrentNote(increment, e) {
    e.preventDefault();
    let { currentNote, currentMeasure } = this.props;
    const staveLength = this.measures.length;
    const measure = this.measures[currentMeasure];
    const { notes } = measure;

    if (increment) {
      const measureLength = notes.length - 1;
      if (currentNote + 1 > measureLength) {
        if (currentMeasure + 1 < staveLength) {
          currentMeasure = Math.max(
            currentMeasure,
            nextNonEmptyMeasure(this.measures, currentMeasure + 1)
          );
          currentNote = 0;
        }
      } else {
        currentNote += 1;
      }
    } else {
      if (currentNote - 1 >= 0) {
        currentNote -= 1;
      } else {
        if (currentMeasure - 1 >= 0) {
          const prev = prevNonEmptyMeasure(this.measures, currentMeasure);
          if (prev >= 0) {
            currentMeasure = prev;
            const measureLength = this.measures[currentMeasure].notes.length;
            currentNote = measureLength - 1;
          }
        }
      }
    }
    this.props.updatePosition({
      currentNote,
      currentMeasure
    });
  }

  setOctave(increment, e) {
    e.preventDefault();
    let { octave } = this.state;
    if (this.solfegeUndefined()) { return; }
    if (increment) {
      octave += 1;
    } else {
      octave -= 1;
    }

    const measures = _.cloneDeep(this.measures);
    const note = this.currentNote(measures);
    note.octave = octave;

    const { currentMeasure, currentNote } = this.props;
    this.props.updateStave(measures, currentMeasure, currentNote);

    this.setState({
      octave
    });
  }

  currentNote(score) {
    const measure = score[this.props.currentMeasure];
    const { notes } = measure;
    return notes[this.props.currentNote];
  }

  noteChange(e, target) {
    const solfege = target? target: e.target.value;
    const measures = _.cloneDeep(this.measures);
    const note = this.currentNote(measures);
    let { octave } = this.state;
    if (_.isString(octave)) {
      octave = parseInt(octave);
    }
    note.solfege = solfege;
    note.octave = octave;

    const { currentMeasure, currentNote } = this.props;
    this.props.updateStave(measures, currentMeasure, currentNote);
  }

  solfegeUndefined() {
    return _.isUndefined(this.currentNote(this.measures).solfege);
  }

  handleDiatonic(e){
    // Assumes the solfege selector is the 2nd select element on the page
    const options = document.getElementsByTagName('select')[2].options;
    let diatonicPresent = false;
    for (var i = 0; i < options.length; i++) {
      if (diatonics[options[i].value] == e.key) {
        diatonicPresent = true;
        options.selectedIndex = i;
        break;
      }
    }
    if (!diatonicPresent) { return; }
    this.noteChange(e, options[i].value);
  }

  handleKeyDown(e) {
    switch(e.key) {
      case 'd':
      case 'r':
      case 'm':
      case 'f':
      case 's':
      case 'l':
      case 't':
        this.handleDiatonic(e)
        break;
      case '<':
      case '>':
        this.props.changeStave(e, true);
        break;
      case ' ':
        changeAudioPlayerState();
        break;
      case 'ArrowUp':
        this.setOctave(true, e);
        break;
      case 'ArrowDown':
        this.setOctave(false, e);
        break;
      case 'ArrowRight':
        this.setCurrentNote(true, e);
        break;
      case 'ArrowLeft':
        this.setCurrentNote(false, e);
        break;
      case 'A':
        playA();
        break;
      case 'Enter':
        this.noteChange(e);
        break;
    }
  }

  changeView() {
    this.props.errors.length = 0;
    clickSave();
  }

  componentDidMount() {
    this.solfegeInput.focus();
    $(this.containerEl).foundation();
  }

  getSnapshotBeforeUpdate(){
    return this.solfegeInput.selectedIndex;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.solfegeInput.selectedIndex = snapshot;
    $(this.containerEl).foundation();
  }

  updateKey(e) {
    const keySignature = e.target.value;
    this.setState({keySignature});
  } 

  render() {
    const { currentMeasure, currentNote } = this.props;
    const measure = this.measures[currentMeasure == -1? 0: currentMeasure];
    const measureNotes = measure.notes;
    const note = measureNotes[currentNote];
    const noteDisplay = `Note (${currentNote + 1}/${measureNotes.length})`;
    const solfege =
      this.props.options.solfege
        .filter(([_, v]) => v)
        .map(([v, _]) => v)
        .reverse();
    let selectedSolfege = _.isUndefined(note) ?
      '' : note.solfege;
    let octaveStr = this.state.octave.toString();
    if (this.state.octave > 0) {
      octaveStr = '+' + octaveStr;
    }
    let solfegeOptions = solfege.map((s) => {
      return (
        <option key={s} value={s}>{s}</option>
      );
    });
    // rests can't have pitch set
    if (note && note.duration && note.duration.match(/r$/)) {
      solfegeOptions = [];
    }

    const keySignature = keyOptionToSignature(this.props.keySignature);
    const keyCorrect = keySignature === getVFScaleName(this.props.stave.tonic, this.props.stave.scale);
    const keyOptions = this.props.options.key
                           .filter(([_, v]) => v)
                           .map(([key, _], i) => {
      return (
        <option key={i + 1} value={key}>{formatKey(key)}</option>
      );
    });
    keyOptions.unshift((<option key={0} value={''}>-</option>));
    const { instructor } = this.props;
    const showIf = (cond) => {
      return cond ?
        {} : {display: 'none'};
    };

    return (
      <div className="row columns" ref={(el) => this.containerEl = el}>
        <div className="reveal" id="help-text-melodic" data-reveal>
          <ul>
            <li><b>Enter - </b> enters the current highlighted solfege</li>
            <li><b>Space - </b> plays/pauses the audio</li>
            <li><b>Right/Left - </b> arrows change current note</li>
            <li><b>Up/Down - </b> raise or lower an octave</li>
            <li><b>Shift+a - </b> Plays the A above middle C for 5 seconds. Can also pause.</li>
            <li><b>&lt;/&gt; - </b> Moves up/down a stave, or cycles around</li>
          </ul>
        </div>
        <div className="row columns" style={showIf(!keyCorrect && !instructor)}>
          <fieldset>
            <legend>Key</legend>
            <select value={this.state.keySignature}
                    onChange={this.updateKey}>
              {keyOptions}
            </select>
            <button className="button"
                    onClick={(e) => this.props.updateKeySignature(this.state.keySignature)}>
              Verify
            </button>
          </fieldset>
        </div>
        <div className="row columns" style={showIf(keyCorrect || instructor)}>
          <fieldset>
            <legend>Solfege</legend>
            <select multiple
                    ref={(input) => this.solfegeInput = input}
                    onBlur={(e) => e.target.focus()}
                    onKeyDown={this.handleKeyDown.bind(this)}
                    style={{width: '75px', height: '230px'}}>
              {solfegeOptions}
            </select>
          </fieldset>
        </div>
        <div className="row columns" style={showIf(keyCorrect || instructor)}>
          <div>
            <Link className="button" to="harmony" onClick={()=>this.changeView()}>
              Proceed to Harmony
            </Link>
          </div>
          <div>
            <Link className="button" to="rhythm" onClick={()=>this.changeView()}>
              Back to Rhythm
            </Link>
          </div>
          <div style={showIf(instructor)}>
            <Link className="button" to="options">Back to Options</Link>
          </div>
          <div>
            <button data-open="help-text-melodic" className="button">
              Show Help
            </button>
          </div>
        </div>
      </div>
    );
  }
}
