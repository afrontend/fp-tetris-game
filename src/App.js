/*
JavaScript Tetris
By Bob Hwang
https://github.com/afrontend/fp-tetris-game
*/

import React, { Component } from 'react';
import * as keyboard from 'keyboard-handler';
import './App.css';
import {
  initTetrisTable,
  downTetrisTable,
  keyTetrisTable,
  joinTetrisTable
} from './fp-tetris';

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
    this.state = initTetrisTable();
    this.state.timer = setInterval(() => {
      this.setState((state) => (downTetrisTable(state)));
    }, 700);

    keyboard.keyPressed(e => {
      setTimeout(() => {
        this.setState((state) => (keyTetrisTable(e.which, state)));
      });
    });
  }

  render() {
    return (
      <div className="container">
        <div className="App">
          <Blocks window={joinTetrisTable(this.state)} />
        </div>
      </div>
    );
  }
}

export default App;
