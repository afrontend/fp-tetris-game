import React from 'react';
import './App.css';
import fpTetris from 'fp-tetris';
import getArgs from './utils/getArgs';
import useGame from './useGame';

const HELP_ITEMS = [
  { key: '← →', action: '좌우 이동' },
  { key: '↑', action: '회전' },
  { key: '↓', action: '빠르게 내리기' },
  { key: 'Space', action: '즉시 낙하' },
  { key: 'P', action: '일시정지 / 재개' },
  { key: 'S', action: '빠른 저장' },
  { key: 'L', action: '빠른 불러오기' },
  { key: 'D', action: '디버그 모드 전환' },
  { key: 'H', action: '도움말 열기 / 닫기' },
  { key: '좌우 스와이프', action: '좌우 이동' },
  { key: '위/아래 스와이프', action: '회전 / 빠르게 내리기' },
  { key: '화면 탭', action: '즉시 낙하' },
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
  const { gameState, showHelp, isDebug, countdown, message, gameOver, appRef } = useGame(fpTetris, {
    createState: () => fpTetris.init({ rows: 17, columns: 12 }),
    initialDebug: getArgs().debug !== undefined,
    isOver: fpTetris.isBlankToolPanel,
  });

  const score = fpTetris.getScore(gameState);

  if (isDebug) {
    const panels = [...fpTetris.toArray(gameState), fpTetris.join(gameState)];
    const labels = ['테트리스 배경 패널', '테트리스 현재 블록 패널', '테트리스 합성 패널'];
    return (
      <div className="debug-layout">
        {panels.map((panel, index) => (
          <div className="container" key={labels[index]}>
            <div className="App" role="application" aria-label={labels[index]} tabIndex={0}>
              <Blocks blocks={panel.flat()} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="score" aria-live="polite" aria-label={`제거한 줄: ${score}`}>
        {score}
      </div>
      <div className="App-wrapper">
        <a href="https://github.com/afrontend/fp-tetris-game" title="fp-tetris-game" style={{ position: 'absolute', top: 8, right: 8, zIndex: 100 }}>
          <img style={{ width: 20, height: 20 }} src="https://agvim.files.wordpress.com/2015/08/github-mark-32px.png?w=685" alt="GitHub" />
        </a>
        <div ref={appRef} className="App" role="application" aria-label="테트리스" tabIndex={0}>
          {countdown !== null ? <div className="status-overlay">{countdown}</div> : null}
          {gameOver ? <div className="game-over-overlay" aria-label="게임 오버">게임 오버</div> : null}
          {gameState.paused && !showHelp && !gameOver ? (
            <div className="pause-overlay" aria-label="일시정지">일시정지</div>
          ) : null}
          {message ? <div className="message-overlay" role="status">{message}</div> : null}
          {showHelp ? (
            <div className="help-overlay" role="dialog" aria-label="도움말">
              <table><tbody>
                {HELP_ITEMS.map(({ key, action }) => (
                  <tr key={key}><td>{key}</td><td>{action}</td></tr>
                ))}
              </tbody></table>
            </div>
          ) : null}
          <Blocks blocks={fpTetris.join(gameState).flat()} />
        </div>
      </div>
    </div>
  );
}

export default App;
