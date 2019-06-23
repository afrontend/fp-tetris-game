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

const getArgs = qs => {
  var args = {};
  var a = '';
  var prop;
  var val;
  var arg;

  try {
    if (qs === undefined) {
      a = window.location.search.split('?')[1].split('&');
    } else {
      a = qs.split('?')[1].split('#')[0].split('&');
    }

    for (prop in a) {
      if (a.hasOwnProperty(prop)) {
        console.log("prop: " + prop + " value: " + a[prop]);
        val = a[prop];
        arg = val.split('=');
        args[arg[0]] = arg[1];
      }
    }
  } catch (e) {
    console.log('Error getArgs window.location.search('+window.location.search+')');
  }
  console.log(JSON.stringify(args));
  return args;
}

const args = getArgs();

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
    this.state = fpTetris.init({ rows: 17, columns: 12 });
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
    return args.debug
      ? (
        <div style={{columns: '400px 3'}}>
          <div className="container">
            <div className="App">
              <Blocks window={_.flatten(fpTetris.toArray(this.state)[0])} />
            </div>
          </div>
          <div className="container">
            <div className="App">
              <Blocks window={_.flatten(fpTetris.toArray(this.state)[1])} />
            </div>
          </div>
          <div className="container">
            <div className="App">
              <Blocks window={_.flatten(fpTetris.join(this.state))} />
            </div>
          </div>
        </div>
      )
      : (
        <div className="container">
          <div className="App">
            <Blocks window={_.flatten(fpTetris.join(this.state))} />
          </div>
        </div>
      );
  }
}

export default App;
