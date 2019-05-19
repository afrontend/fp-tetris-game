/*
JavaScript Tetris
By Bob Hwang
https://github.com/afrontend/fp-tetris-game
*/
import * as keyboard from 'keyboard-handler';
import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';
import fpTetris from 'fp-tetris';

const SPACE = 32;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;

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
  { keyValue: SPACE, keySymbol: 'space'},
  { keyValue: LEFT, keySymbol: 'left' },
  { keyValue: UP, keySymbol: 'up' },
  { keyValue: RIGHT, keySymbol: 'right' },
  { keyValue: DOWN, keySymbol: 'down' }
];

const getKeySymbol = (keyValue) => {
  const found = _.find(keyList, key => (key.keyValue === keyValue));
  return found ? found.keySymbol : null;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = fpTetris.init();
    this.state.timer = setInterval(() => {
      this.setState(state => fpTetris.tick(state));
    }, 700);

    keyboard.keyPressed(e => {
      setTimeout(() => {
        this.setState(state => {
          const symbol = getKeySymbol(e.which);
          return symbol ? fpTetris.key(symbol, state) : state;
        });
      });
    });
  }

  render() {
    return (
      <div className="container">
        <div className="App">
          <Blocks window={_.flatten(fpTetris.join(this.state))} />
        </div>
      </div>
    );
  }
}

export default App;
