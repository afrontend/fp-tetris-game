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
  { key: 'D',     action: '디버그 모드 전환' },
  { key: 'H',     action: '도움말 닫기' },
];

const Block = React.memo(({ color }) => (
  <div
    className={`block${color !== 'grey' ? ' block--filled' : ''}`}
    style={color !== 'grey' ? { '--c': color } : undefined}
  />
));

const Blocks = ({ blocks }) =>
  blocks.map((item, index) => <Block color={item.color} key={index} />);

function App() {
  const [gameState, setGameState] = useState(() => fpTetris.init({ rows: 17, columns: 12 }));
  const [showHelp, setShowHelp] = useState(false);
  const [isDebug, setIsDebug] = useState(() => getArgs().debug !== undefined);
  const savedState = useRef(null);
  const showHelpRef = useRef(false);
  const appRef = useRef(null);

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
      if (symbol === 'debug') {
        setIsDebug(d => !d);
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

  useEffect(() => {
    const el = appRef.current;
    if (!el || !('ontouchstart' in window)) return;
    let startX = 0, startY = 0;
    const onTouchStart = e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      e.preventDefault();
    };
    const onTouchEnd = e => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const absDx = Math.abs(dx), absDy = Math.abs(dy);
      let symbol = null;
      if (absDx < 10 && absDy < 10) {
        symbol = 'space';
      } else if (Math.max(absDx, absDy) > 30) {
        symbol = absDx > absDy ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      }
      if (symbol) {
        setTimeout(() => {
          setGameState(s => {
            if (symbol === 'save') { savedState.current = structuredClone(s); return s; }
            if (symbol === 'reload') return savedState.current ?? s;
            return fpTetris.key(symbol, s);
          });
        });
      }
      e.preventDefault();
    };
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return isDebug
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
        <div className="App-wrapper">
          <a href="https://github.com/afrontend/fp-tetris-game" title="fp-tetris-game" style={{ position: 'absolute', top: 8, right: 8, zIndex: 100 }}>
            <img style={{ width: 20, height: 20 }} src="https://agvim.files.wordpress.com/2015/08/github-mark-32px.png?w=685" alt="GitHub" />
          </a>
          <div ref={appRef} className="App" role="application" aria-label="Tetris" tabIndex={0}>
          {gameOver ? (
            <div className="game-over-overlay" aria-label="Game over">GAME OVER</div>
          ) : null}
          {(gameState.pause && !showHelp) ? (
            <div className="pause-overlay" aria-label="Game paused">PAUSED</div>
          ) : null}
          {showHelp ? (
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
          ) : null}
          <Blocks blocks={fpTetris.join(gameState).flat()} />
          </div>
        </div>
      </div>
    );
}

export default App;
