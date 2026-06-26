import * as keyboard from 'keyboard-handler';
import React, { useState, useEffect, useRef } from 'react';
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

const args = getArgs();

const Block = React.memo(({ color }) => (
  <div className="block" style={{ backgroundColor: color }} />
));

const Blocks = ({ blocks }) =>
  blocks.map((item, index) => <Block color={item.color} key={index} />);

function App() {
  const [gameState, setGameState] = useState(() => fpTetris.init({ rows: 17, columns: 12 }));
  const [showHelp, setShowHelp] = useState(false);
  const savedState = useRef(null);
  const showHelpRef = useRef(false);

  const score = fpTetris.getScore(gameState);
  const gameOver = fpTetris.isBlankToolPanel(gameState);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setGameState(s => showHelpRef.current ? s : fpTetris.tick(s));
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
      // setTimeout으로 다음 이벤트 루프에서 처리해
      // 방향키 입력이 setInterval 틱과 겹치지 않도록 함
      setTimeout(() => {
        setGameState(s => {
          if (symbol === 'save') {
            savedState.current = structuredClone(s);
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
            <Blocks blocks={fpTetris.toArray(gameState)[0].flat()} />
          </div>
        </div>
        <div className="container">
          <div className="App" role="application" aria-label="Tetris debug: piece">
            <Blocks blocks={fpTetris.toArray(gameState)[1].flat()} />
          </div>
        </div>
        <div className="container">
          <div className="App" role="application" aria-label="Tetris debug: combined">
            <Blocks blocks={fpTetris.join(gameState).flat()} />
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
          {gameState.pause && !showHelp && (
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
          <Blocks blocks={fpTetris.join(gameState).flat()} />
        </div>
      </div>
    );
}

export default App;
