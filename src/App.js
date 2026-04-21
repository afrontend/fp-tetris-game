import * as keyboard from 'keyboard-handler';
import React, { Component } from 'react';
import _ from 'lodash';
import './App.css';
import fpTetris from 'fp-tetris';
import getArgs from './utils/getArgs';

const SPACE = 32;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const SKey = 83;
const RKey = 82;

const createBlocks = ary => (
  ary.map(
    (item, index) => (
      <Block color={item.color} key={index}>
        {item.count}
      </Block>
    )
  )
);

const args = getArgs();

const Block = props => (<div className="block" style={{backgroundColor: props.color}}>{props.children}</div>);
const Blocks = props => (createBlocks(props.window));

const keyList = [
  { keyValue: SPACE, keySymbol: 'space'},
  { keyValue: LEFT, keySymbol: 'left' },
  { keyValue: UP, keySymbol: 'up' },
  { keyValue: RIGHT, keySymbol: 'right' },
  { keyValue: DOWN, keySymbol: 'down' },
  { keyValue: SKey, keySymbol: 'save' },
  { keyValue: RKey, keySymbol: 'reload' }
];

const getKeySymbol = keyValue => {
  const found = _.find(keyList, key => (key.keyValue === keyValue));
  return found ? found.keySymbol : null;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.savedState = null;
    this.state = fpTetris.init({ rows: 17, columns: 12 });
    this.state.timer = setInterval(() => {
      this.setState(state => fpTetris.tick(state));
    }, 700);

    keyboard.keyPressed(e => {
      setTimeout(() => {
        this.setState(state => {
          const symbol = getKeySymbol(e.which);
          if (symbol === 'save') {
            this.savedState = _.cloneDeep(state);
            return state;
          } else if (symbol === 'reload') {
            return this.savedState ? this.savedState : state;
          } else {
            return symbol ? fpTetris.key(symbol, state) : state;
          }
        });
      });
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
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
