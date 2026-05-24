import * as keyboard from 'keyboard-handler';
import React, { useState, useEffect, useRef } from 'react';
import flatten from 'lodash/flatten';
import cloneDeep from 'lodash/cloneDeep';
import './App.css';
import fpTetris from 'fp-tetris';
import getArgs from './utils/getArgs';
import getInterval from './utils/getInterval';
import { getKeySymbol } from './utils/keyMap';

const HELP_ITEMS = [
  { key: '← →',   action: '좌우 이동' },
  { key: '↑',     action: '회전' },
  { key: '↓',     action: '빠르게 내리기' },
  { key: 'Space', action: '즉시 낙하' },
  { key: 'P',     action: '일시정지 / 재개' },
  { key: 'S',     action: '상태 저장' },
  { key: 'L',     action: '상태 불러오기' },
  { key: 'R',     action: '배경 회전' },
  { key: 'H',     action: '도움말 닫기' },
];

const createBlocks = ary => (
  ary.map(
    (item, index) => <Block color={item.color} key={index} />
  )
);

const args = getArgs();

const Block = React.memo(({ color }) => (
  <div className="block" style={{backgroundColor: color}} />
));
const Blocks = props => (createBlocks(props.window));

function App() {
  const [state, setState] = useState(() => fpTetris.init({ rows: 17, columns: 12 }));
  const [showHelp, setShowHelp] = useState(false);
  const savedState = useRef(null);
  const showHelpRef = useRef(false);

  const score = fpTetris.getScore(state);
  const gameOver = fpTetris.isBlankToolPanel(state);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setState(s => showHelpRef.current ? s : fpTetris.tick(s));
    }, getInterval(score));
    return () => clearInterval(timer);
  }, [score, gameOver]);

  useEffect(() => {
    const removeKeyListener = keyboard.keyPressed(e => {
      const symbol = getKeySymbol(e.which);
      if (symbol === 'help') {
        showHelpRef.current = !showHelpRef.current;
        setShowHelp(h => !h);
        return;
      }
      setTimeout(() => {
        setState(s => {
          if (symbol === 'save') {
            savedState.current = cloneDeep(s);
            return s;
          }
          if (symbol === 'reload') {
            return savedState.current ?? s;
          }
          return symbol ? fpTetris.key(symbol, s) : s;
        });
      });
    });
    return () => removeKeyListener();
  }, []);

  return args.debug
    ? (
      <div className="debug-layout">
        <div className="container">
          <div className="App" role="application" aria-label="Tetris debug: board">
            <Blocks window={flatten(fpTetris.toArray(state)[0])} />
          </div>
        </div>
        <div className="container">
          <div className="App" role="application" aria-label="Tetris debug: piece">
            <Blocks window={flatten(fpTetris.toArray(state)[1])} />
          </div>
        </div>
        <div className="container">
          <div className="App" role="application" aria-label="Tetris debug: combined">
            <Blocks window={flatten(fpTetris.join(state))} />
          </div>
        </div>
      </div>
    )
    : (
      <div className="container">
        <div className="score" aria-live="polite" aria-label={`Score: ${score}`}>
          {score}
        </div>
        <div className="App" role="application" aria-label="Tetris" tabIndex={0}>
          {gameOver && (
            <div className="game-over-overlay" aria-label="Game over">GAME OVER</div>
          )}
          {state.pause && !showHelp && (
            <div className="pause-overlay" aria-label="Game paused">PAUSED</div>
          )}
          {showHelp && (
            <div className="help-overlay" role="dialog" aria-label="도움말">
              <table>
                <tbody>
                  {HELP_ITEMS.map(({ key, action }) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Blocks window={flatten(fpTetris.join(state))} />
        </div>
      </div>
    );
}

export default App;
