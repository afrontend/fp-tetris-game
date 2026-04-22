import * as keyboard from 'keyboard-handler';
import React, { useState, useEffect, useRef } from 'react';
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

function App() {
  const [state, setState] = useState(() => fpTetris.init({ rows: 17, columns: 12 }));
  const savedState = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setState(s => fpTetris.tick(s));
    }, 700);

    keyboard.keyPressed(e => {
      setTimeout(() => {
        setState(s => {
          const symbol = getKeySymbol(e.which);
          if (symbol === 'save') {
            savedState.current = _.cloneDeep(s);
            return s;
          } else if (symbol === 'reload') {
            return savedState.current ? savedState.current : s;
          } else {
            return symbol ? fpTetris.key(symbol, s) : s;
          }
        });
      });
    });

    return () => clearInterval(timer);
  }, []);

  return args.debug
    ? (
      <div style={{columns: '400px 3'}}>
        <div className="container">
          <div className="App">
            <Blocks window={_.flatten(fpTetris.toArray(state)[0])} />
          </div>
        </div>
        <div className="container">
          <div className="App">
            <Blocks window={_.flatten(fpTetris.toArray(state)[1])} />
          </div>
        </div>
        <div className="container">
          <div className="App">
            <Blocks window={_.flatten(fpTetris.join(state))} />
          </div>
        </div>
      </div>
    )
    : (
      <div className="container">
        <div className="App">
          <Blocks window={_.flatten(fpTetris.join(state))} />
        </div>
      </div>
    );
}

export default App;
