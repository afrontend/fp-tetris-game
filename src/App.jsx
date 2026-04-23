import * as keyboard from 'keyboard-handler';
import React, { useState, useEffect, useRef } from 'react';
import flatten from 'lodash/flatten';
import cloneDeep from 'lodash/cloneDeep';
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

const Block = React.memo(({ color, children }) => (
  <div className="block" style={{backgroundColor: color}}>{children}</div>
));
const Blocks = props => (createBlocks(props.window));

const KEY_MAP = new Map([
  [SPACE, 'space'],
  [LEFT, 'left'],
  [UP, 'up'],
  [RIGHT, 'right'],
  [DOWN, 'down'],
  [SKey, 'save'],
  [RKey, 'reload'],
]);

const getKeySymbol = keyValue => KEY_MAP.get(keyValue) ?? null;

function App() {
  const [state, setState] = useState(() => fpTetris.init({ rows: 17, columns: 12 }));
  const savedState = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setState(s => fpTetris.tick(s));
    }, 700);

    const removeKeyListener = keyboard.keyPressed(e => {
      setTimeout(() => {
        setState(s => {
          const symbol = getKeySymbol(e.which);
          if (symbol === 'save') {
            savedState.current = cloneDeep(s);
            return s;
          } else if (symbol === 'reload') {
            return savedState.current ? savedState.current : s;
          } else {
            return symbol ? fpTetris.key(symbol, s) : s;
          }
        });
      });
    });

    return () => {
      clearInterval(timer);
      removeKeyListener();
    };
  }, []);

  return args.debug
    ? (
      <div style={{columns: '400px 3'}}>
        <div className="container">
          <div className="App">
            <Blocks window={flatten(fpTetris.toArray(state)[0])} />
          </div>
        </div>
        <div className="container">
          <div className="App">
            <Blocks window={flatten(fpTetris.toArray(state)[1])} />
          </div>
        </div>
        <div className="container">
          <div className="App">
            <Blocks window={flatten(fpTetris.join(state))} />
          </div>
        </div>
      </div>
    )
    : (
      <div className="container">
        <div className="App">
          <Blocks window={flatten(fpTetris.join(state))} />
        </div>
      </div>
    );
}

export default App;
