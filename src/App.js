/*
JavaScript Tetris
By Bob Hwang
https://github.com/afrontend/fp-tetris-game
*/

import React, { Component } from 'react';
import * as keyboard from 'keyboard-handler';
import './App.css';
import {
  CONFIG,
  processKey,
  scrollDownPanel,
  createPanel,
  getWindow,
  createRandomToolPanel
} from './fp-tetris';

// components

const createBlocks = ary => (
  ary.map(
    (item, index) => (
      <Block color={item.color} key={index}>
        {item.count}
      </Block>
    )
  )
);

const Block = props => (<div className="block" style={{backgroundColor: props.color}}>{props.children}</div>);
const Blocks = props => (createBlocks(props.window));

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bgPanel: createPanel(),
      toolPanel: createRandomToolPanel()
    };

    this.state.timer = setInterval(() => {
      this.setState((state) => {
        return scrollDownPanel({
          bgPanel: state.bgPanel,
          toolPanel: state.toolPanel
        });
      });
    }, 700);

    keyboard.keyPressed(e => {
      setTimeout(() => {
        this.setState((state) => {
          return processKey(e.which, {
            bgPanel: state.bgPanel,
            toolPanel: state.toolPanel
          })
        });
      });
    });
  }

  render() {
    return (
      <div className="container">
        <div className="App">
          <Blocks window={getWindow({
            bgPanel: this.state.bgPanel,
            toolPanel: this.state.toolPanel
          })} />
        </div>
      </div>
    );
  }
}

export default App;
