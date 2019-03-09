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
} from 'fp-tetris';
import _ from 'lodash';

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

const keyList = [
  { keyValue: 32, keySymbol: 'space'},
  { keyValue: 37, keySymbol: 'left' },
  { keyValue: 38, keySymbol: 'up' },
  { keyValue: 39, keySymbol: 'right' },
  { keyValue: 40, keySymbol: 'down' }
];

const getKeySymbol = (keyValue) => {
  const found = _.find(keyList, key => (key.keyValue === keyValue));
  return found ? found.keySymbol : null;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initTetrisTable();
    this.state.timer = setInterval(() => {
      this.setState((state) => (downTetrisTable(state)));
    }, 700);

    keyboard.keyPressed(e => {
      setTimeout(() => {
        this.setState((state) => {
          const symbol = getKeySymbol(e.which);
          return symbol ? keyTetrisTable(symbol, state) : state;
        });
      });
    });
  }

  render() {
    return (
      <div className="container">
        <div className="App">
          <Blocks window={_.flatten(joinTetrisTable(this.state))} />
        </div>
      </div>
    );
  }
}

export default App;
