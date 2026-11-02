// 세 웹 게임(fp-tetris-game·fp-block-game·fp-snake-game)이 같은 내용으로 갖는 파일이다.
// 고칠 때는 세 앱에 똑같이 복사한다. 확인: ~/src/afrontend 에서
//   diff fp-tetris-game/src/useGame.js fp-block-game/src/useGame.js
//   diff fp-tetris-game/src/useGame.js fp-snake-game/src/useGame.js
import * as keyboard from 'keyboard-handler';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getKeySymbol } from './utils/keyMap';

const COUNTDOWN_SECONDS = 3;
const MESSAGE_MS = 2000;
const TAP_PX = 10;
const SWIPE_PX = 30;

// 탭은 space, 스와이프는 가장 크게 움직인 방향으로 바꾼다.
export const swipeToSymbol = ({ dx, dy }) => {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (absDx < TAP_PX && absDy < TAP_PX) return 'space';
  if (Math.max(absDx, absDy) <= SWIPE_PX) return null;
  if (absDx > absDy) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
};

/**
 * 게임 루프·카운트다운·키보드·스와이프·빠른 저장/불러오기·상태 메시지를 담당한다.
 * @param {object} game fp-* 게임 라이브러리 (init·tick·key·getTickInterval·serializeState·restoreState)
 * @param {object} [options]
 * @param {function} [options.createState] 초기 상태 (기본 game.init())
 * @param {function} [options.isOver] 상태 → 게임 오버 여부 (true 면 tick 을 멈춘다)
 * @param {function} [options.toSymbol] 스와이프 {dx, dy} → 키 이름 (기본 swipeToSymbol)
 * @param {boolean} [options.initialDebug] 디버그 화면으로 시작할지
 */
export default function useGame(game, options = {}) {
  const {
    createState = () => game.init(),
    isOver = () => false,
    toSymbol = swipeToSymbol,
    initialDebug = false,
  } = options;
  const [gameState, setGameState] = useState(createState);
  const [showHelp, setShowHelp] = useState(false);
  const [isDebug, setIsDebug] = useState(initialDebug);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [message, setMessage] = useState('');
  const savedState = useRef(null);
  const showHelpRef = useRef(false);
  const countdownRef = useRef(COUNTDOWN_SECONDS);
  const messageTimer = useRef(null);
  const appRef = useRef(null);

  const gameOver = isOver(gameState);
  const tickInterval = game.getTickInterval(gameState);

  const showStatus = useCallback((text) => {
    setMessage(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(''), MESSAGE_MS);
  }, []);

  const pressKey = useCallback(
    (symbol) => setTimeout(() => setGameState((state) => game.key(symbol, state))),
    [game],
  );

  useEffect(() => () => clearTimeout(messageTimer.current), []);

  useEffect(() => {
    countdownRef.current = countdown;
  }, [countdown]);

  useEffect(() => {
    const timers = [];
    for (let left = COUNTDOWN_SECONDS - 1; left >= 0; left -= 1) {
      const value = left === 0 ? null : left;
      timers.push(setTimeout(() => setCountdown(value), (COUNTDOWN_SECONDS - left) * 1000));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (countdown !== null || gameOver || tickInterval === null) return undefined;
    const timer = setInterval(() => {
      setGameState((state) => (showHelpRef.current ? state : game.tick(state)));
    }, tickInterval);
    return () => clearInterval(timer);
  }, [game, tickInterval, gameOver, countdown]);

  useEffect(() => {
    const removeKeyListener = keyboard.keyPressed((event) => {
      if (countdownRef.current !== null) return;
      const symbol = getKeySymbol(event.which);
      if (symbol === 'help') {
        showHelpRef.current = !showHelpRef.current;
        setShowHelp((value) => !value);
        return;
      }
      if (symbol === 'debug') {
        setIsDebug((value) => !value);
        return;
      }
      if (symbol === 'save') {
        setGameState((state) => {
          savedState.current = game.serializeState(state);
          return state;
        });
        showStatus('빠르게 저장했습니다.');
        return;
      }
      if (symbol === 'load') {
        if (!savedState.current) {
          showStatus('저장된 상태가 없습니다.');
          return;
        }
        try {
          setGameState(game.restoreState(savedState.current));
          showStatus('저장된 상태를 불러왔습니다.');
        } catch (error) {
          console.error(error);
          showStatus('저장된 상태를 불러올 수 없습니다.');
        }
        return;
      }
      if (showHelpRef.current || !symbol) return;
      pressKey(symbol);
    });
    return () => removeKeyListener();
  }, [game, pressKey, showStatus]);

  useEffect(() => {
    const element = appRef.current;
    if (!element || !('ontouchstart' in window)) return undefined;
    let startX = 0;
    let startY = 0;
    const onTouchStart = (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      event.preventDefault();
    };
    const onTouchEnd = (event) => {
      if (countdownRef.current !== null || showHelpRef.current) return;
      const symbol = toSymbol({
        dx: event.changedTouches[0].clientX - startX,
        dy: event.changedTouches[0].clientY - startY,
      });
      if (symbol) pressKey(symbol);
      event.preventDefault();
    };
    element.addEventListener('touchstart', onTouchStart, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: false });
    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDebug, toSymbol, pressKey]);

  return { gameState, showHelp, isDebug, countdown, message, gameOver, appRef };
}
