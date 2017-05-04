import React from 'react';
import PropTypes from 'prop-types';

import VexflowComponent from './vexflow';

const data = {
  score: [
    {type: 'note', keys: ['b/4'], duration: 'hr'},
    // {type: 'barline', barType: 'SINGLE'},
    {type: 'note', keys: ['b/4'], duration: 'hr'},
    // {type: 'barline', barType: 'SINGLE'},
    {type: 'beam', notes: [
      {type: 'note', keys: ['f/4'], duration: '8'},
      {type: 'note', keys: ['a/4'], duration: '8'}
    ]},
    {type: 'beam', notes: [
      {type: 'note', keys: ['b/4'], duration: '8'},
      {type: 'note', keys: ['b/4'], duration: '8'}
    ]}
  ],
  answer: [],
  meter: {top: 2, bottom: 4},
  clef: 'treble'
};

export default class PSetStudentComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="small-12">
        <div className="row">
          <div className="small-12 large-8 small-centered">
            <h3>Practice PSet: Melody Entry</h3>
            <p>
              Key: <i>Example key</i>
            </p>
          </div>
        </div>
        <div className="row">
          <div className="small-12 large-8 small-centered">
            <VexflowComponent {...data} />
          </div>
        </div>
        <div className="row">
          <div className="small-12 large-8 large-centered">
            <div className="row large-up-6">
              <div className="column column-block">
                <form>
                  <select multiple style={{width: '40px', height: '230px'}}>
                    <option value="si">si</option>
                    <option value="fi">fi</option>
                    <option value="ri">ri</option>
                    <option value="di">di</option>
                    <option value="t">t</option>
                    <option value="l">l</option>
                    <option value="s">s</option>
                    <option value="m">m</option>
                    <option value="r">r</option>
                    <option value="d">d</option>
                  </select>
                  <br />
                  <input type="submit" className="button" value="Add" />
                </form>
              </div>
              <div className="column column-block">
                <form>
                  <legend>
                    Octave (3)
                    <p>
                      <input type="submit" className="button" value="+" />
                    </p>
                    <p>
                      <input type="submit" className="button" value="-" />
                    </p>
                    <p>
                      <input type="submit" className="button" value="Undo" />
                    </p>
                  </legend>
                </form>
              </div>
              <div className="column column-block">
                Current note: 5
              </div>
              <div className="column column-block">
                &nbsp;
              </div>
              <div className="column column-block">
                &nbsp;
              </div>
              <div className="column column-block">
                <form>
                  <input type="submit" className="button" value="Save" />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
